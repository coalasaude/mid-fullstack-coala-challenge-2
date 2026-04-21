export type Role = 'ATTENDANT' | 'DOCTOR';

export type ExamStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'DONE'
  | 'ERROR'
  | 'REPORTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface MedicalExam {
  id: string;
  patientName: string;
  examType: string;
  status: ExamStatus;
  processingResult: string | null;
  report: string | null;
  createdById: string;
  reportedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
