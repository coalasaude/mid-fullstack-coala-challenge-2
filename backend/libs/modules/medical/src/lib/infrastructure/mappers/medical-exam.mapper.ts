import {
  MedicalExam as PrismaMedicalExam,
  MedicalExamStatus as PrismaMedicalExamStatus,
} from '@prisma/client';
import { Option } from '@healthflow/shared';
import { MedicalExam } from '../../domain/entities/medical-exam.entity';
import { EMedicalExamStatus } from '../../domain/enums/medical-exam-status.enum';

export class MedicalExamMapper {
  static toDomain(row: PrismaMedicalExam): MedicalExam {
    return new MedicalExam({
      id: row.id,
      status: row.status as EMedicalExamStatus,
      fileName: row.fileName,
      mimeType: row.mimeType,
      fileSize: row.fileSize,
      storagePath: row.storagePath,
      processingResult: row.processingResult,
      report: row.report,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(exam: MedicalExam): {
    id: string;
    status: PrismaMedicalExamStatus;
    fileName: string;
    mimeType: string;
    fileSize: number;
    storagePath: Option<string>;
    processingResult: Option<string>;
    report: Option<string>;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: exam.id,
      status: exam.status as PrismaMedicalExamStatus,
      fileName: exam.fileName,
      mimeType: exam.mimeType,
      fileSize: exam.fileSize,
      storagePath: exam.storagePath,
      processingResult: exam.processingResult,
      report: exam.report,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    };
  }
}
