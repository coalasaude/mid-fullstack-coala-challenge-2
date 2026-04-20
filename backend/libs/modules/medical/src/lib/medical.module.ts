import { Module } from '@nestjs/common';
import { ObservabilityModule } from '@healthflow/observability';
import { ProvidersModule } from '@healthflow/providers';
import { CreateReportUseCase } from './application/use-cases/create-report.use-case';
import { ListExamsUseCase } from './application/use-cases/list-exams.use-case';
import { UploadExamUseCase } from './application/use-cases/upload-exam.use-case';
import { ExamProcessingQueuePort } from './domain/ports/exam-processing-queue.port';
import { MedicalExamRepository } from './domain/repositories/medical-exam.repository';
import { ExamConsumerService } from './application/messaging/exam-consumer.service';
import { ExamDlqConsumer } from './application/messaging/exam-dlq-consumer.service';
import { ExamProcessingQueueAdapter } from './application/messaging/exam-processing-queue.adapter';
import { PrismaMedicalExamRepository } from './infrastructure/repositories/prisma-medical-exam.repository';
import { ExamsController } from './presentation/http/controllers/exams.controller';

@Module({
  imports: [ProvidersModule, ObservabilityModule],
  controllers: [ExamsController],
  providers: [
    ExamConsumerService,
    ExamDlqConsumer,
    { provide: MedicalExamRepository, useClass: PrismaMedicalExamRepository },
    { provide: ExamProcessingQueuePort, useClass: ExamProcessingQueueAdapter },
    UploadExamUseCase,
    ListExamsUseCase,
    CreateReportUseCase,
  ],
})
export class MedicalModule {}
