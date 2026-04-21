import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import {
  EXAM_DLX_EXCHANGE,
  EXAM_DLX_ROUTING_KEY,
  EXAM_PROCESSING_DLQ,
  EXAM_PROCESSING_QUEUE,
} from './rabbitmq.constants';

type ConsumerHandler = (msg: amqp.ConsumeMessage) => Promise<void>;

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const url = this.config.get<string>('RABBITMQ_URL');
    if (!url) throw new Error('RABBITMQ_URL is not defined');

    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(EXAM_DLX_EXCHANGE, 'direct', {
      durable: true,
    });
    await this.channel.assertQueue(EXAM_PROCESSING_DLQ, { durable: true });
    await this.channel.bindQueue(
      EXAM_PROCESSING_DLQ,
      EXAM_DLX_EXCHANGE,
      EXAM_DLX_ROUTING_KEY,
    );

    await this.channel.assertQueue(EXAM_PROCESSING_QUEUE, {
      durable: true,
      deadLetterExchange: EXAM_DLX_EXCHANGE,
      deadLetterRoutingKey: EXAM_DLX_ROUTING_KEY,
    });

    this.channel.prefetch(1);

    this.connection.on('error', (err) => this.logger.error(err.message));
    this.connection.on('close', () => this.logger.warn('connection closed'));

    this.logger.log('connected');
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (err) {
      this.logger.warn((err as Error).message);
    }
  }

  publish(queue: string, payload: unknown): boolean {
    if (!this.channel) throw new Error('channel is not ready');
    const buffer = Buffer.from(JSON.stringify(payload));
    return this.channel.sendToQueue(queue, buffer, { persistent: true });
  }

  async consume(queue: string, handler: ConsumerHandler) {
    if (!this.channel) throw new Error('channel is not ready');
    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        await handler(msg);
        this.channel!.ack(msg);
      } catch (err) {
        this.logger.error(
          `handler failed on ${queue}: ${(err as Error).message}`,
        );
        this.channel!.nack(msg, false, false);
      }
    });
  }
}
