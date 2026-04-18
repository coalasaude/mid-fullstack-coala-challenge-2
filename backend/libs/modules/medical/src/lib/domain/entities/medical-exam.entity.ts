import { Entity, err, ok, Option, Result } from '@healthflow/shared';
import { randomUUID } from 'crypto';
import { MedicalExamReportError } from '../errors';
import { EMedicalExamStatus } from '../enums/medical-exam-status.enum';
import { ExamDocument } from './exam-document.entity';
import { User } from './user.entity';

export interface MedicalExamProps {
  id: string;
  status: EMedicalExamStatus;
  examDocument: ExamDocument;
  processingResult: Option<string>;
  report: Option<string>;
  uploadedBy: User;
  reportedBy: Option<User>;
  createdAt: Date;
  updatedAt: Date;
}

export class MedicalExam extends Entity<MedicalExamProps> {
  get status(): EMedicalExamStatus {
    return this.props.status;
  }

  get examDocument(): ExamDocument {
    return this.props.examDocument;
  }

  get fileName(): string {
    return this.props.examDocument.fileName;
  }

  get mimeType(): string {
    return this.props.examDocument.mimeType;
  }

  get fileSize(): number {
    return this.props.examDocument.fileSize;
  }

  get fileUrl(): Option<string> {
    return this.props.examDocument.url;
  }

  get processingResult(): Option<string> {
    return this.props.processingResult;
  }

  get report(): Option<string> {
    return this.props.report;
  }

  get uploadedBy(): User {
    return this.props.uploadedBy;
  }

  get reportedBy(): Option<User> {
    return this.props.reportedBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(input: {
    examDocument: ExamDocument;
    uploadedBy: User;
  }): MedicalExam {
    const now = new Date();
    return new MedicalExam({
      id: randomUUID(),
      status: EMedicalExamStatus.PENDING,
      examDocument: input.examDocument,
      processingResult: null,
      report: null,
      uploadedBy: input.uploadedBy,
      reportedBy: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  toProcessing(): void {
    this.props.status = EMedicalExamStatus.PROCESSING;
    this.props.updatedAt = new Date();
  }

  markDone(processingResult: string): void {
    this.props.status = EMedicalExamStatus.DONE;
    this.props.processingResult = processingResult;
    this.props.updatedAt = new Date();
  }

  markError(processingResult: string): void {
    this.props.status = EMedicalExamStatus.ERROR;
    this.props.processingResult = processingResult;
    this.props.updatedAt = new Date();
  }

  reportTo(
    report: string,
    reportedBy: User,
  ): Result<void, MedicalExamReportError> {
    if (this.props.status !== EMedicalExamStatus.DONE) {
      return err(MedicalExamReportError.notInDoneStatus);
    }
    this.props.report = report;
    this.props.reportedBy = reportedBy;
    this.props.status = EMedicalExamStatus.REPORTED;
    this.props.updatedAt = new Date();
    return ok(undefined);
  }
}
