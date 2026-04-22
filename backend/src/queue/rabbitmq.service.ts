import {
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private initPromise: Promise<void> | null = null;
  private queueName: string;

  constructor(private readonly configService: ConfigService) {
    this.queueName =
      this.configService.get<string>('RABBITMQ_EXAM_QUEUE') ||
      'exam_processing_queue';
  }

  async onModuleInit() {
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = this.connect();
    await this.initPromise;
  }

  private async connect() {
    const rabbitmqUrl =
      this.configService.get<string>('RABBITMQ_URL') ||
      'amqp://localhost:5672';

    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(this.queueName, { durable: true });

    this.connection = connection;
    this.channel = channel;
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async publishExamProcessing(examId: string) {
    await this.onModuleInit();

    if (!this.channel) {
      throw new InternalServerErrorException('RabbitMQ channel not initialized');
    }

    const published = this.channel.sendToQueue(
      this.queueName,
      Buffer.from(JSON.stringify({ examId })),
      { persistent: true },
    );

    if (!published) {
      throw new InternalServerErrorException(
        'Failed to publish exam processing message',
      );
    }
  }

  async consumeExamProcessing(
    handler: (examId: string) => Promise<void>,
  ): Promise<void> {
    await this.onModuleInit();

    if (!this.channel) {
      throw new InternalServerErrorException('RabbitMQ channel not initialized');
    }

    await this.channel.consume(this.queueName, async (msg) => {
      if (!msg) {
        return;
      }

      try {
        const { examId } = JSON.parse(msg.content.toString()) as {
          examId?: string;
        };

        if (!examId) {
          this.channel?.ack(msg);
          return;
        }

        await handler(examId);
        this.channel?.ack(msg);
      } catch {
        this.channel?.ack(msg);
      }
    });
  }
}
