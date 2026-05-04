import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Channel, ChannelModel } from 'amqplib';
import { connect } from 'amqplib';
import type { ConsumedMessage, PublishOptions } from './message-broker';
import { MessageBroker } from './message-broker';
import { Option } from '@healthflow/shared';

function normalizeHeaders(
  raw: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (Buffer.isBuffer(v)) {
      out[k] = v.toString('utf8');
    } else if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = normalizeHeaders(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

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

  async ensureRetryTopology(
    mainQueue: string,
    retryQueue: string,
    deadLetterQueue: string,
  ): Promise<void> {
    if (!this.publishChannel || !this.consumeChannel) {
      throw new Error('RabbitMQ channels are not available');
    }

    const assertTopology = async (ch: Channel) => {
      await ch.assertQueue(deadLetterQueue, { durable: true });
      await ch.assertQueue(mainQueue, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': deadLetterQueue,
        },
      });
      await ch.assertQueue(retryQueue, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': mainQueue,
        },
      });
    };

    await assertTopology(this.publishChannel);
    await assertTopology(this.consumeChannel);

    this.logger.log(
      `Retry topology asserted: main="${mainQueue}", retry="${retryQueue}", dlq="${deadLetterQueue}"`,
    );
  }

  async publishToQueue(
    queue: string,
    body: Buffer,
    options?: PublishOptions,
  ): Promise<void> {
    if (!this.publishChannel) {
      return Promise.reject(
        new Error('RabbitMQ publish channel is not available'),
      );
    }
    const publishOptions: {
      persistent: boolean;
      headers?: Record<string, unknown>;
      expiration?: string;
    } = { persistent: true };
    if (options?.headers) {
      publishOptions.headers = options.headers;
    }
    if (options?.expirationMs !== undefined) {
      publishOptions.expiration = String(options.expirationMs);
    }
    this.publishChannel.sendToQueue(queue, body, publishOptions);
    return Promise.resolve();
  }

  async consumeQueue(
    queue: string,
    handler: (message: ConsumedMessage) => Promise<void>,
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
          const consumed: ConsumedMessage = {
            body: msg.content,
            headers: normalizeHeaders(
              msg.properties.headers as Record<string, unknown> | undefined,
            ),
          };
          try {
            await handler(consumed);
            this.consumeChannel.ack(msg);
          } catch (error) {
            this.logger.warn(
              `Queue "${queue}" → ${error instanceof Error ? error.message : String(error)}`,
            );
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
