import { ERole } from '@healthflow/shared';
import { EMedicalExamStatus } from '../enums/medical-exam-status.enum';
import { User } from './user.entity';
import { MedicalExam } from './medical-exam.entity';
import { ExamDocument } from './exam-document.entity';

const makeUploader = () =>
  User.fromPrimitives({
    id: 'user-attendant',
    email: 'att@hospital.com',
    role: ERole.ATTENDANT,
  });

const makeDoctor = () =>
  User.fromPrimitives({
    id: 'user-doctor',
    email: 'doc@hospital.com',
    role: ERole.DOCTOR,
  });

const makeExam = () =>
  MedicalExam.create({
    examDocument: ExamDocument.create({
      fileName: 'chest.dcm',
      mimeType: 'application/dicom',
      fileSize: 1024,
    }),
    uploadedBy: makeUploader(),
  });

describe('MedicalExam', () => {
  describe('create', () => {
    it('should create an exam with PENDING status', () => {
      const exam = makeExam();
      expect(exam.status).toBe(EMedicalExamStatus.PENDING);
    });

    it('should assign a generated id', () => {
      const exam = makeExam();
      expect(exam.id).toBeDefined();
      expect(typeof exam.id).toBe('string');
    });

    it('should initialize report and processingResult as null', () => {
      const exam = makeExam();
      expect(exam.report).toBeNull();
      expect(exam.processingResult).toBeNull();
    });

    it('should initialize reportedBy as null', () => {
      const exam = makeExam();
      expect(exam.reportedBy).toBeNull();
    });

    it('should store fileName, mimeType, fileSize and uploadedBy on document', () => {
      const uploader = makeUploader();
      const exam = MedicalExam.create({
        examDocument: ExamDocument.create({
          fileName: 'chest.dcm',
          mimeType: 'application/dicom',
          fileSize: 1024,
        }),
        uploadedBy: uploader,
      });
      expect(exam.uploadedBy.id).toBe(uploader.id);
      expect(exam.examDocument.fileName).toBe('chest.dcm');
      expect(exam.examDocument.mimeType).toBe('application/dicom');
      expect(exam.examDocument.fileSize).toBe(1024);
    });
  });

  describe('attachUrl', () => {
    it('should update url on exam document', () => {
      const exam = makeExam();
      exam.examDocument.attachUrl('https://bucket/x');
      expect(exam.examDocument.url).toBe('https://bucket/x');
    });

    it('should update exam updatedAt', () => {
      const exam = makeExam();
      const before = new Date();
      exam.examDocument.attachUrl('https://example.com/f');
      expect(exam.examDocument.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });

  describe('toProcessing', () => {
    it('should change status to PROCESSING', () => {
      const exam = makeExam();
      exam.toProcessing();
      expect(exam.status).toBe(EMedicalExamStatus.PROCESSING);
    });
  });

  describe('markDone', () => {
    it('should change status to DONE and set processingResult', () => {
      const exam = makeExam();
      exam.markDone('Processing completed');
      expect(exam.status).toBe(EMedicalExamStatus.DONE);
      expect(exam.processingResult).toBe('Processing completed');
    });
  });

  describe('markError', () => {
    it('should change status to ERROR and set processingResult', () => {
      const exam = makeExam();
      exam.markError('Failed to process');
      expect(exam.status).toBe(EMedicalExamStatus.ERROR);
      expect(exam.processingResult).toBe('Failed to process');
    });
  });

  describe('reportTo', () => {
    it('should fail when exam is not in DONE status', () => {
      const exam = makeExam();
      const result = exam.reportTo('Some report', makeDoctor());
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Exam is not in DONE status');
      }
    });

    it('should fail when exam is in PROCESSING status', () => {
      const exam = makeExam();
      exam.toProcessing();
      const result = exam.reportTo('Some report', makeDoctor());
      expect(result.ok).toBe(false);
    });

    it('should succeed when exam is in DONE status', () => {
      const exam = makeExam();
      exam.markDone('AI result');
      const doctor = makeDoctor();
      const result = exam.reportTo('No anomalies', doctor);
      expect(result.ok).toBe(true);
    });

    it('should update report, reportedBy and status to REPORTED on success', () => {
      const exam = makeExam();
      exam.markDone('AI result');
      const doctor = makeDoctor();
      exam.reportTo('No anomalies', doctor);
      expect(exam.report).toBe('No anomalies');
      expect(exam.reportedBy?.id).toBe(doctor.id);
      expect(exam.status).toBe(EMedicalExamStatus.REPORTED);
    });
  });
});
