import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isErr } from '@healthflow/shared';
import { MedicalExamRepository } from '../../domain/repositories/medical-exam.repository';
import { CreateReportCommand } from '../commands/create-report.command';

@Injectable()
export class CreateReportUseCase {
  constructor(private readonly medicalExamRepository: MedicalExamRepository) {}

  async execute(command: CreateReportCommand) {
    const exam = await this.medicalExamRepository.findById(command.examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const errorOrVoid = exam.reportTo(command.report, command.reportedBy);

    if (isErr(errorOrVoid)) {
      throw new BadRequestException(errorOrVoid.error as string);
    }

    const updatedExam = await this.medicalExamRepository.persist(exam);

    return {
      id: updatedExam.id,
      status: updatedExam.status,
      fileName: updatedExam.fileName,
      mimeType: updatedExam.mimeType,
      fileSize: updatedExam.fileSize,
      storagePath: updatedExam.storagePath,
      processingResult: updatedExam.processingResult,
      report: updatedExam.report,
      createdAt: updatedExam.createdAt,
      updatedAt: updatedExam.updatedAt,
      reportedBy: {
        id: updatedExam.reportedBy?.id,
        email: updatedExam.reportedBy?.email,
        role: updatedExam.reportedBy?.role,
      },
      uploadedBy: {
        id: updatedExam.uploadedBy.id,
        email: updatedExam.uploadedBy.email,
        role: updatedExam.uploadedBy.role,
      },
    };
  }
}
