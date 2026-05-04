import { ExamDocument } from './exam-document.entity';

describe('ExamDocument', () => {
  describe('create', () => {
    it('should create with file metadata and null storage', () => {
      const doc = ExamDocument.create({
        fileName: 'chest.dcm',
        mimeType: 'application/dicom',
        fileSize: 2048,
      });
      expect(doc.fileName).toBe('chest.dcm');
      expect(doc.mimeType).toBe('application/dicom');
      expect(doc.fileSize).toBe(2048);
      expect(doc.url).toBeNull();
    });

    it('should generate id', () => {
      const a = ExamDocument.create({
        fileName: 'a.dcm',
        mimeType: 'application/dicom',
        fileSize: 1,
      });
      const b = ExamDocument.create({
        fileName: 'b.dcm',
        mimeType: 'application/dicom',
        fileSize: 1,
      });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('attachStorage', () => {
    it('should set url', () => {
      const doc = ExamDocument.create({
        fileName: 'x.pdf',
        mimeType: 'application/pdf',
        fileSize: 10,
      });
      doc.attachUrl('https://bucket/x.pdf');
      expect(doc.url).toBe('https://bucket/x.pdf');
    });
  });
});
