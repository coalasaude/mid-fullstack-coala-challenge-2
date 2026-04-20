import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBroker } from '@healthflow/infra';
import { ExamProcessingQueuePort } from '../../domain/ports/exam-processing-queue.port';
import { err, ok, Result } from '@healthflow/shared';

@Injectable()
export class ExamProcessingQueueAdapter extends ExamProcessingQueuePort {
  private readonly logger = new Logger(ExamProcessingQueueAdapter.name);

  constructor(
    private readonly broker: MessageBroker,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  override async publishExamQueued(
    examId: string,
  ): Promise<Result<void, Error>> {
    const queue = this.configService.getOrThrow<string>('examProcessing.queue');
    const body = Buffer.from(JSON.stringify({ examId }));
    try {
      await this.broker.publishToQueue(queue, body);
      return ok(undefined);
    } catch (error) {
      const errorMessage = `Failed to publish exam ${examId} to queue with error: ${error instanceof Error ? error.message : String(error)}`;
      this.logger.error(errorMessage, error);
      return err(new Error(errorMessage));
    }
  }
}
