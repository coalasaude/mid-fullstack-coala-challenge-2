import { request } from '../http';
import type {
  CreateReportResponse,
  ExamListItem,
  UploadExamResponse,
} from '@/shared/types';

export const examsEndpoints = {
  list() {
    return request<ExamListItem[]>('/exams', { method: 'GET' });
  },
  upload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return request<UploadExamResponse>('/exams/upload', {
      method: 'POST',
      formData: fd,
    });
  },
  submitReport(id: string, report: string) {
    return request<CreateReportResponse>(`/exams/${id}/report`, {
      method: 'POST',
      body: { report },
    });
  },
};
