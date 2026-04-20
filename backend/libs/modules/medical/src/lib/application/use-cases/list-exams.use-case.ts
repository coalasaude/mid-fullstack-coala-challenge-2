import { Injectable } from '@nestjs/common';
import { EMedicalExamStatus } from '../../domain/enums/medical-exam-status.enum';
import { MedicalExamRepository } from '../../domain/repositories/medical-exam.repository';
import { ListExamsCommand } from '../commands/list-exams.command';
import { ListExamItemResponseDto } from '../../presentation/http/dto/list-exam-item-response.dto';

@Injectable()
export class ListExamsUseCase {
  constructor(private readonly medicalExamRepository: MedicalExamRepository) {}

  async execute(command: ListExamsCommand) {
    const user = command.user;
    const exams = user.isDoctor()
      ? await this.medicalExamRepository.getBy(
          {
            status: EMedicalExamStatus.DONE,
          },
          {
            createdAt: 'desc',
          },
        )
      : await this.medicalExamRepository.getBy(
          {},
          {
            createdAt: 'desc',
          },
        );

    const result = exams.map(
      (exam) =>
        new ListExamItemResponseDto({
          id: exam.id,
          status: exam.status,
          examDocument: exam.examDocument,
          report: exam.report,
          createdAt: exam.createdAt,
          reportedBy: exam.reportedBy,
          uploadedBy: exam.uploadedBy,
        }),
    );

    return result;
  }
}
