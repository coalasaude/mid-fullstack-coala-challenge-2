import { api } from '@/services/api';
import type { MedicalExam } from '@/types/exam';

export async function listExams(): Promise<MedicalExam[]> {
  const { data } = await api.get<MedicalExam[]>('/exams');
  return data;
}

export async function uploadExam(fileReference: string): Promise<MedicalExam> {
  const { data } = await api.post<MedicalExam>('/exams/upload', {
    fileReference,
  });
  return data;
}
