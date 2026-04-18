import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { basename } from 'path';
import { IObjectStorageProvider, isErr, ok, Result } from '@healthflow/shared';
import {
  EUserAccessLogAction,
  UserAccessLogEventPort,
} from '@healthflow/observability';
import { MedicalExam } from '../../domain/entities/medical-exam.entity';
import { ExamProcessingQueuePort } from '../../domain/ports/exam-processing-queue.port';
import { MedicalExamRepository } from '../../domain/repositories/medical-exam.repository';
import { UploadExamCommand } from '../commands/upload-exam.command';
import { UploadExamResponseDto } from '../../presentation/http/dto/upload-exam-response.dto';

@Injectable()
export class UploadExamUseCase {
  constructor(
    private readonly medicalExamRepository: MedicalExamRepository,
    private readonly examProcessingQueue: ExamProcessingQueuePort,
    private readonly objectStorage: IObjectStorageProvider,
    private readonly userAccessLogEvents: UserAccessLogEventPort,
  ) {}

  async execute(command: UploadExamCommand) {
    const exam = MedicalExam.create({
      fileName: command.fileName,
      mimeType: command.mimeType,
      fileSize: command.fileSize,
      storagePath: null,
      uploadedBy: command.uploadedBy,
    });

    const objectKeyResult = await this.getObjectKey(exam, command.fileBuffer);

    if (isErr(objectKeyResult)) {
      throw new InternalServerErrorException(objectKeyResult.error);
    }

    const storageKey = objectKeyResult.ok ? objectKeyResult.value : undefined;
    exam.setStoragePath(storageKey as string);

    const updatedExam = await this.medicalExamRepository.persist(exam);

    const publishExamQueuedResult =
      await this.examProcessingQueue.publishExamQueued(updatedExam.id);
    if (isErr(publishExamQueuedResult)) {
      throw new InternalServerErrorException(publishExamQueuedResult.error);
    }

    const result = new UploadExamResponseDto({
      id: updatedExam.id,
      status: updatedExam.status,
      processingResult: updatedExam.processingResult,
    });

    await this.userAccessLogEvents.publish({
      module: 'medical',
      useCase: 'UploadExamUseCase',
      userId: command.uploadedBy.id,
      action: EUserAccessLogAction.UPLOAD_EXAM,
      description: `Uploaded exam ${updatedExam.id} (${command.fileName}) by ${command.uploadedBy.id}`,
      occurredAt: new Date().toISOString(),
    });

    return result;
  }

  private async getObjectKey(
    exam: MedicalExam,
    fileBuffer: Buffer,
  ): Promise<Result<string, Error>> {
    const safeName = basename(exam.fileName).replace(/[^\w.-]+/g, '_');
    const objectKey = ['medical-exams', exam.id, safeName].join('/');

    const result = await this.objectStorage.putObject({
      key: objectKey,
      body: fileBuffer,
      contentType: exam.mimeType,
    });

    if (isErr(result)) {
      return result;
    }

    return ok(objectKey);
  }
}
