export type MedicalExamStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'DONE'
  | 'ERROR'
  | 'REPORTED';

export type MedicalExam = {
  id: string;
  fileReference: string;
  status: MedicalExamStatus;
  processingResult: string | null;
  report: string | null;
  attendantId: string;
  createdAt: string;
  updatedAt: string;
};
