import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { extname } from 'path';
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
import { ExamDocument } from '../../domain/entities/exam-document.entity';

@Injectable()
export class UploadExamUseCase {
  constructor(
    private readonly medicalExamRepository: MedicalExamRepository,
    private readonly examProcessingQueue: ExamProcessingQueuePort,
    private readonly objectStorage: IObjectStorageProvider,
    private readonly userAccessLogEvents: UserAccessLogEventPort,
  ) {}

  async execute(command: UploadExamCommand) {
    const examDocument = ExamDocument.create({
      fileName: command.fileName,
      mimeType: command.mimeType,
      fileSize: command.fileSize,
    });

    const uploadResult = await this.uploadExamFile(
      examDocument,
      command.fileBuffer,
    );

    if (isErr(uploadResult)) {
      throw new InternalServerErrorException(uploadResult.error);
    }
    const { url } = uploadResult.ok ? uploadResult.value : { url: '' };

    examDocument.attachUrl(url);

    const exam = MedicalExam.create({
      examDocument,
      uploadedBy: command.uploadedBy,
    });

    const createdExam = await this.medicalExamRepository.persist(exam);

    const publishExamQueuedResult =
      await this.examProcessingQueue.publishExamQueued(createdExam.id);
    if (isErr(publishExamQueuedResult)) {
      throw new InternalServerErrorException(publishExamQueuedResult.error);
    }

    const result = new UploadExamResponseDto({
      id: createdExam.id,
      status: createdExam.status,
      processingResult: createdExam.processingResult,
      url: createdExam.fileUrl,
    });

    await this.userAccessLogEvents.publish({
      module: 'medical',
      useCase: 'UploadExamUseCase',
      userId: command.uploadedBy.id,
      action: EUserAccessLogAction.UPLOAD_EXAM,
      description: `Uploaded exam ${createdExam.id} (${command.fileName}) by ${command.uploadedBy.id}`,
      occurredAt: new Date().toISOString(),
    });

    return result;
  }

  private async uploadExamFile(
    examDocument: ExamDocument,
    fileBuffer: Buffer,
  ): Promise<Result<{ url: string }, Error>> {
    const extension = extname(examDocument.fileName)
      .toLowerCase()
      .replace(/[^.a-z0-9]/g, '')
      .slice(0, 10);
    const objectKey = [
      'medical-exams',
      examDocument.id,
      `${examDocument.id}${extension}`,
    ].join('/');

    const result = await this.objectStorage.putObject({
      key: objectKey,
      body: fileBuffer,
      contentType: examDocument.mimeType,
    });

    if (isErr(result)) {
      return result;
    }

    const url = result.ok ? result.value.url : '';
    return ok({ url });
  }
}
