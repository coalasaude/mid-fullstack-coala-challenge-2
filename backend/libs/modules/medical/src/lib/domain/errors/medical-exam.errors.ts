export const MedicalExamReportError = {
  notInDoneStatus: 'Exam is not in DONE status',
} as const;

export type MedicalExamReportError =
  (typeof MedicalExamReportError)[keyof typeof MedicalExamReportError];
