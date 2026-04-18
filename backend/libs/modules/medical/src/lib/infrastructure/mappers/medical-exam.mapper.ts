import {
  MedicalExamStatus as PrismaMedicalExamStatus,
  Prisma,
  type User as PrismaUser,
} from '@prisma/client';
import { ERole } from '@healthflow/shared';
import { MedicalExam } from '../../domain/entities/medical-exam.entity';
import { User } from '../../domain/entities/user.entity';
import { EMedicalExamStatus } from '../../domain/enums/medical-exam-status.enum';
import { ExamDocumentMapper } from './exam-document.mapper';

export type MedicalExamRow = Prisma.MedicalExamGetPayload<{
  include: { uploadedBy: true; reportedBy: true; examDocument: true };
}>;

export class MedicalExamMapper {
  private static userToDomain(row: PrismaUser): User {
    return new User({
      id: row.id,
      email: row.email,
      role: row.role as ERole,
    });
  }

  static toDomain(row: MedicalExamRow): MedicalExam {
    if (!row.examDocument) {
      throw new Error(`MedicalExam ${row.id} is missing examDocument aggregate`);
    }
    return new MedicalExam({
      id: row.id,
      status: row.status as EMedicalExamStatus,
      examDocument: ExamDocumentMapper.toDomain(row.examDocument),
      processingResult: row.processingResult,
      report: row.report,
      uploadedBy: MedicalExamMapper.userToDomain(row.uploadedBy),
      reportedBy: row.reportedBy
        ? MedicalExamMapper.userToDomain(row.reportedBy)
        : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistenceUnchecked(exam: MedicalExam) {
    return {
      id: exam.id,
      status: exam.status as PrismaMedicalExamStatus,
      processingResult: exam.processingResult,
      report: exam.report,
      uploadedById: exam.uploadedBy.id,
      reportedById: exam.reportedBy?.id ?? null,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    };
  }
}
