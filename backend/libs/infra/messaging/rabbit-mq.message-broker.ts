import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Channel, ChannelModel } from 'amqplib';
import { connect } from 'amqplib';
import { MessageBroker } from './message-broker';
import { Option } from '@healthflow/shared';

@Injectable()
export class RabbitMqMessageBroker
  extends MessageBroker
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMqMessageBroker.name);
  private connection: Option<ChannelModel> = null;
  private publishChannel: Option<Channel> = null;
  private consumeChannel: Option<Channel> = null;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  get ready(): boolean {
    return this.publishChannel !== null && this.consumeChannel !== null;
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    const url = this.configService.get<string>('rabbitmq.url');
    if (!url) {
      this.logger.warn(
        'RABBITMQ_URL not set; message broker stays unavailable',
      );
      return;
    }

    try {
      const channelModel = await connect(url);
      this.connection = channelModel;
      this.publishChannel = await channelModel.createChannel();
      this.consumeChannel = await channelModel.createChannel();
      this.logger.log('RabbitMQ connected');
    } catch (err) {
      this.logger.error('Failed to connect to RabbitMQ', err);
      await this.closeChannelsOnly();
      this.connection = null;
    }
  }

  async disconnect(): Promise<void> {
    await this.closeChannelsOnly();
    if (this.connection) {
      await this.connection.close().catch(() => undefined);
      this.connection = null;
    }
  }

  async ensureQueueWithDeadLetter(
    mainQueue: string,
    deadLetterQueue: string,
  ): Promise<void> {
    if (!this.publishChannel || !this.consumeChannel) {
      throw new Error('RabbitMQ channels are not available');
    }

    await this.publishChannel.assertQueue(deadLetterQueue, { durable: true });
    await this.publishChannel.assertQueue(mainQueue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': deadLetterQueue,
      },
    });

    await this.consumeChannel.assertQueue(deadLetterQueue, { durable: true });
    await this.consumeChannel.assertQueue(mainQueue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': deadLetterQueue,
      },
    });

    this.logger.log(
      `Queues asserted: "${mainQueue}" with DLQ "${deadLetterQueue}"`,
    );
  }

  async publishToQueue(queue: string, body: Buffer): Promise<void> {
    if (!this.publishChannel) {
      return Promise.reject(
        new Error('RabbitMQ publish channel is not available'),
      );
    }
    this.publishChannel.sendToQueue(queue, body, { persistent: true });
    return Promise.resolve();
  }

  async consumeQueue(
    queue: string,
    handler: (body: Buffer) => Promise<void>,
    options?: { prefetch?: number },
  ): Promise<void> {
    if (!this.consumeChannel) {
      this.logger.warn(
        'RabbitMQ consume channel not available; consumer not started',
      );
      return;
    }

    const prefetch = options?.prefetch ?? 5;
    await this.consumeChannel.prefetch(prefetch);

    await this.consumeChannel.consume(
      queue,
      (msg) => {
        void (async () => {
          if (!msg || !this.consumeChannel) {
            return;
          }
          try {
            await handler(msg.content);
            this.consumeChannel.ack(msg);
          } catch (err) {
            this.logger.error('Message consumer handler error', err);
            this.consumeChannel.nack(msg, false, false);
          }
        })();
      },
      { noAck: false },
    );

    this.logger.log(`Subscribed to queue "${queue}"`);
  }

  private async closeChannelsOnly(): Promise<void> {
    await this.publishChannel?.close().catch(() => undefined);
    await this.consumeChannel?.close().catch(() => undefined);
    this.publishChannel = null;
    this.consumeChannel = null;
  }
}
