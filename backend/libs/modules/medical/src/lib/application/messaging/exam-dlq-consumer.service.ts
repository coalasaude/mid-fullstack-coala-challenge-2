import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeadLetterQueueConsumer, MessageBroker } from '@healthflow/infra';
import { FailedMessageRepository } from '@healthflow/observability';
import { ExamConsumerService } from './exam-consumer.service';

@Injectable()
export class ExamDlqConsumer
  extends DeadLetterQueueConsumer<{ examId: string }>
  implements OnModuleInit
{
  constructor(
    broker: MessageBroker,
    failedMessageRepository: FailedMessageRepository,
    private readonly configService: ConfigService,
    private readonly examConsumer: ExamConsumerService,
  ) {
    super(broker, failedMessageRepository);
  }

  protected parsePayload(body: Buffer): { examId: string } {
    const parsed = JSON.parse(body.toString()) as { examId?: string };
    if (!parsed.examId) {
      throw new Error('missing examId');
    }
    return { examId: parsed.examId };
  }

  protected async reprocess(payload: { examId: string }): Promise<void> {
    await this.examConsumer.processExam(payload.examId);
  }

  async onModuleInit(): Promise<void> {
    await this.start({
      mainQueue: this.configService.getOrThrow<string>('examProcessing.queue'),
      retryQueue: this.configService.getOrThrow<string>(
        'examProcessing.retryQueue',
      ),
      dlq: this.configService.getOrThrow<string>('examProcessing.dlq'),
      backoffMs: [5000, 10000, 15000],
    });
  }
}
