jest.mock('@healthflow/observability', () => ({
  UserAccessLogEventPort: class UserAccessLogEventPort {},
  EUserAccessLogAction: {
    UPLOAD_EXAM: 'UPLOAD_EXAM',
    CREATE_REPORT: 'CREATE_REPORT',
  },
}));

import { InternalServerErrorException } from '@nestjs/common';
import { ERole, IObjectStorageProvider } from '@healthflow/shared';
import { UserAccessLogEventPort } from '@healthflow/observability';
import { MedicalExam } from '../../domain/entities/medical-exam.entity';
import { User } from '../../domain/entities/user.entity';
import { EMedicalExamStatus } from '../../domain/enums/medical-exam-status.enum';
import { ExamProcessingQueuePort } from '../../domain/ports/exam-processing-queue.port';
import { MedicalExamRepository } from '../../domain/repositories/medical-exam.repository';
import { UploadExamCommand } from '../commands/upload-exam.command';
import { UploadExamUseCase } from './upload-exam.use-case';

const makeAttendant = () => ({
  id: 'attendant-1',
  email: 'attendant@hospital.com',
  role: ERole.ATTENDANT,
});

const makeCommand = () =>
  new UploadExamCommand(
    'chest.dcm',
    'application/dicom',
    1024,
    Buffer.from('file content'),
    makeAttendant(),
  );

const makePersistedExam = (): MedicalExam => {
  const uploader = User.fromPrimitives(makeAttendant());
  const exam = MedicalExam.create({
    fileName: 'chest.dcm',
    mimeType: 'application/dicom',
    fileSize: 1024,
    uploadedBy: uploader,
  });
  exam.attachExamDocumentStorage(
    'medical-exams/exam-id/chest.dcm',
    'https://bucket.example.com/medical-exams/exam-id/chest.dcm',
  );
  return exam;
};

describe('UploadExamUseCase', () => {
  let useCase: UploadExamUseCase;
  let medicalExamRepository: jest.Mocked<MedicalExamRepository>;
  let examProcessingQueue: jest.Mocked<ExamProcessingQueuePort>;
  let objectStorage: jest.Mocked<IObjectStorageProvider>;
  let userAccessLogEvents: jest.Mocked<UserAccessLogEventPort>;

  beforeEach(() => {
    medicalExamRepository = {
      persist: jest.fn(),
      findById: jest.fn(),
      getBy: jest.fn(),
    } as unknown as jest.Mocked<MedicalExamRepository>;

    examProcessingQueue = {
      publishExamQueued: jest
        .fn()
        .mockResolvedValue({ ok: true, value: undefined }),
    } as unknown as jest.Mocked<ExamProcessingQueuePort>;

    objectStorage = {
      putObject: jest.fn().mockResolvedValue({
        ok: true,
        value: { url: 'https://bucket.example.com/medical-exams/test/chest.dcm' },
      }),
    } as unknown as jest.Mocked<IObjectStorageProvider>;

    userAccessLogEvents = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UserAccessLogEventPort>;

    useCase = new UploadExamUseCase(
      medicalExamRepository,
      examProcessingQueue,
      objectStorage,
      userAccessLogEvents,
    );
  });

  it('should upload an exam and publish to queue', async () => {
    const persistedExam = makePersistedExam();
    medicalExamRepository.persist.mockResolvedValue(persistedExam);

    const result = await useCase.execute(makeCommand());

    expect(objectStorage.putObject).toHaveBeenCalledTimes(1);
    expect(medicalExamRepository.persist).toHaveBeenCalledTimes(1);
    expect(examProcessingQueue.publishExamQueued).toHaveBeenCalledWith(
      persistedExam.id,
    );
    expect(result.id).toBe(persistedExam.id);
    expect(result.status).toBe(EMedicalExamStatus.PENDING);
    expect(result.url).toBe(persistedExam.fileUrl);
  });

  it('should publish user access log after upload', async () => {
    const persistedExam = makePersistedExam();
    medicalExamRepository.persist.mockResolvedValue(persistedExam);

    await useCase.execute(makeCommand());

    expect(userAccessLogEvents.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        module: 'medical',
        useCase: 'UploadExamUseCase',
        userId: makeAttendant().id,
      }),
    );
  });

  it('should throw InternalServerErrorException when object storage fails', async () => {
    objectStorage.putObject.mockResolvedValue({
      ok: false,
      error: new Error('S3 unavailable'),
    });

    await expect(useCase.execute(makeCommand())).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(medicalExamRepository.persist).not.toHaveBeenCalled();
  });

  it('should throw InternalServerErrorException when queue publish fails', async () => {
    const persistedExam = makePersistedExam();
    medicalExamRepository.persist.mockResolvedValue(persistedExam);
    examProcessingQueue.publishExamQueued.mockResolvedValue({
      ok: false,
      error: new Error('RabbitMQ unavailable'),
    });

    await expect(useCase.execute(makeCommand())).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
