import { Entity, err, ok, Option, Result } from '@healthflow/shared';
import { randomUUID } from 'crypto';
import { MedicalExamReportError } from '../errors';
import { EMedicalExamStatus } from '../enums/medical-exam-status.enum';
import { User } from './user.entity';

export interface MedicalExamProps {
  id: string;
  status: EMedicalExamStatus;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: Option<string>;
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

  get fileName(): string {
    return this.props.fileName;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get fileSize(): number {
    return this.props.fileSize;
  }

  get storagePath(): Option<string> {
    return this.props.storagePath;
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
    fileName: string;
    mimeType: string;
    fileSize: number;
    storagePath: Option<string>;
    uploadedBy: User;
  }): MedicalExam {
    const now = new Date();
    return new MedicalExam({
      id: randomUUID(),
      status: EMedicalExamStatus.PENDING,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      storagePath: input.storagePath,
      processingResult: null,
      report: null,
      uploadedBy: input.uploadedBy,
      reportedBy: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  setStoragePath(storagePath: string): void {
    this.props.storagePath = storagePath;
    this.props.updatedAt = new Date();
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
