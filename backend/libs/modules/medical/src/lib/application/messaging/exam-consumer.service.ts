import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBroker } from '@healthflow/infra';
import { MedicalExamRepository } from '../../domain/repositories/medical-exam.repository';

function randomDelayMs(): number {
  return 1000 + Math.floor(Math.random() * 2000);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

@Injectable()
export class ExamConsumerService implements OnModuleInit {
  private readonly logger = new Logger(ExamConsumerService.name);

  constructor(
    private readonly medicalExamRepository: MedicalExamRepository,
    private readonly broker: MessageBroker,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.broker.ready) {
      this.logger.warn('Message broker unavailable; exam consumer not started');
      return;
    }

    const mainQueue = this.configService.getOrThrow<string>(
      'examProcessing.queue',
    );
    const retryQueue = this.configService.getOrThrow<string>(
      'examProcessing.retryQueue',
    );
    const dlq = this.configService.getOrThrow<string>('examProcessing.dlq');

    await this.broker.ensureRetryTopology(mainQueue, retryQueue, dlq);

    await this.broker.consumeQueue(
      mainQueue,
      async ({ body }) => {
        const parsed = JSON.parse(body.toString()) as { examId?: string };
        if (!parsed.examId) {
          return;
        }
        await this.processExam(parsed.examId);
      },
      { prefetch: 5 },
    );
  }

  async processExam(examId: string): Promise<void> {
    const exam = await this.medicalExamRepository.findById(examId);
    if (!exam) return;

    exam.toProcessing();
    await this.medicalExamRepository.persist(exam);

    await delay(randomDelayMs());

    const randomNumber = Math.random();
    const success = randomNumber < 0.8;

    if (success) {
      this.logger.log(`Exam ${examId} processed successfully (simulated).`);
      exam.markDone('Processing completed successfully (simulated).');
      await this.medicalExamRepository.persist(exam);
      return;
    }
    exam.markError('Simulated processing failure.');
    await this.medicalExamRepository.persist(exam);
    throw new Error(`Simulated processing failure (exam ${examId})`);
  }
}
