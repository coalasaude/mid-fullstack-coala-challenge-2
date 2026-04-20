import { Option } from '@healthflow/shared';
import { EMedicalExamStatus } from '../enums/medical-exam-status.enum';
import { MedicalExam } from '../entities/medical-exam.entity';

export abstract class MedicalExamRepository {
  abstract persist(exam: MedicalExam): Promise<MedicalExam>;

  abstract findById(id: string): Promise<Option<MedicalExam>>;

  abstract getBy(
    filters: {
      status?: EMedicalExamStatus;
    },
    orderBy: {
      createdAt: 'asc' | 'desc';
    },
  ): Promise<MedicalExam[]>;
}
