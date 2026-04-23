import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MedicalExamStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMqService } from './rabbitmq.service';

@Injectable()
export class ExamProcessingConsumer implements OnModuleInit {
  private readonly logger = new Logger(ExamProcessingConsumer.name);

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.rabbitMqService.consumeExamProcessing(async (examId: string) => {
      await this.processExam(examId);
    });
  }

  private async processExam(examId: string) {
    const exam = await this.prisma.medicalExam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      this.logger.warn(`Exam not found for processing: ${examId}`);
      return;
    }

    try {
      await this.prisma.medicalExam.update({
        where: { id: examId },
        data: { status: MedicalExamStatus.PROCESSING },
      });

      const processingMs = this.randomInt(1000, 4000);
      await this.delay(processingMs);

      const isSuccess = Math.random() >= 0.3;

      if (isSuccess) {
        await this.prisma.medicalExam.update({
          where: { id: examId },
          data: {
            status: MedicalExamStatus.DONE,
            processingResult: `Processing completed successfully in ${processingMs}ms`,
          },
        });
        return;
      }

      await this.prisma.medicalExam.update({
        where: { id: examId },
        data: {
          status: MedicalExamStatus.ERROR,
          processingResult: 'Processing failed due to simulated analysis error',
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected processing error';

      this.logger.error(
        `Unexpected error while processing exam ${examId}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
