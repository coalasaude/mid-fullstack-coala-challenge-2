import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isErr } from '@healthflow/shared';
import {
  EUserAccessLogAction,
  UserAccessLogEventPort,
} from '@healthflow/observability';
import { MedicalExamRepository } from '../../domain/repositories/medical-exam.repository';
import { CreateReportCommand } from '../commands/create-report.command';
import { CreateReportResponseDto } from '../../presentation/http/dto/create-report-response.dto';
import { ExamUserDto } from '../../presentation/http/dto/exam-user.dto';

@Injectable()
export class CreateReportUseCase {
  constructor(
    private readonly medicalExamRepository: MedicalExamRepository,
    private readonly userAccessLogEvents: UserAccessLogEventPort,
  ) {}

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

    const result = new CreateReportResponseDto({
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
      reportedBy: new ExamUserDto({
        id: updatedExam.reportedBy?.id,
        email: updatedExam.reportedBy?.email,
        role: updatedExam.reportedBy?.role,
      }),
      uploadedBy: new ExamUserDto({
        id: updatedExam.uploadedBy.id,
        email: updatedExam.uploadedBy.email,
        role: updatedExam.uploadedBy.role,
      }),
    });

    await this.userAccessLogEvents.publish({
      module: 'medical',
      useCase: 'CreateReportUseCase',
      userId: command.reportedBy.id,
      action: EUserAccessLogAction.CREATE_REPORT,
      description: `Reported exam ${command.examId} by ${command.reportedBy.id}`,
      occurredAt: new Date().toISOString(),
    });

    return result;
  }
}
