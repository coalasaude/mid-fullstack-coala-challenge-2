import { Injectable } from '@nestjs/common';
import { ERole } from '@healthflow/shared';
import { EMedicalExamStatus } from '../../domain/enums/medical-exam-status.enum';
import { MedicalExamRepository } from '../../domain/repositories/medical-exam.repository';
import { ListExamsCommand } from '../commands/list-exams.command';

@Injectable()
export class ListExamsUseCase {
  constructor(private readonly medicalExamRepository: MedicalExamRepository) {}

  async execute(command: ListExamsCommand) {
    const exams =
      command.requesterRole === ERole.DOCTOR
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

    return exams.map((exam) => ({
      id: exam.id,
      status: exam.status,
      fileName: exam.fileName,
      report: exam.report,
      createdAt: exam.createdAt,
    }));
  }
}
