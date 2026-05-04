import {
  Prisma,
  type ExamDocument as PrismaExamDocument,
} from '@prisma/client';
import { ExamDocument } from '../../domain/entities/exam-document.entity';

export class ExamDocumentMapper {
  static toDomain(row: PrismaExamDocument): ExamDocument {
    return new ExamDocument({
      id: row.id,
      fileName: row.fileName,
      mimeType: row.mimeType,
      fileSize: row.fileSize,
      url: row.url,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toCreateNested(
    examDocument: ExamDocument,
  ): Prisma.ExamDocumentCreateWithoutMedicalExamInput {
    return {
      id: examDocument.id,
      fileName: examDocument.fileName,
      mimeType: examDocument.mimeType,
      fileSize: examDocument.fileSize,
      url: examDocument.url,
      createdAt: examDocument.createdAt,
      updatedAt: examDocument.updatedAt,
    };
  }

  static toUpdateNested(
    examDocument: ExamDocument,
  ): Prisma.ExamDocumentUpdateWithoutMedicalExamInput {
    return {
      fileName: examDocument.fileName,
      mimeType: examDocument.mimeType,
      fileSize: examDocument.fileSize,
      url: examDocument.url,
      updatedAt: examDocument.updatedAt,
    };
  }
}
