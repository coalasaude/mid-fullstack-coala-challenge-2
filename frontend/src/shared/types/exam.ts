import { ERole } from './role';

export enum EMedicalExamStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  ERROR = 'ERROR',
  REPORTED = 'REPORTED',
}

export interface ExamDocument {
  fileName: string;
  mimeType: string;
  fileSize: number;
  url: string | null;
}

export interface ExamUserRef {
  id?: string;
  email?: string;
  role?: ERole;
}

export interface ExamListItem {
  id: string;
  status: EMedicalExamStatus;
  examDocument: ExamDocument;
  report: string | null;
  createdAt: string;
  reportedBy: ExamUserRef;
  uploadedBy: ExamUserRef;
}

export interface UploadExamResponse {
  id: string;
  status: EMedicalExamStatus;
  processingResult: string | null;
  url: string | null;
}

export interface CreateReportResponse {
  id: string;
  status: EMedicalExamStatus;
  examDocument: ExamDocument;
  processingResult: string | null;
  report: string | null;
  createdAt: string;
  updatedAt: string;
  reportedBy: ExamUserRef;
  uploadedBy: ExamUserRef;
}
