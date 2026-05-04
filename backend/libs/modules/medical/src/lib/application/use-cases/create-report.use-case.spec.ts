jest.mock('@healthflow/observability', () => ({
  UserAccessLogEventPort: class UserAccessLogEventPort {},
  EUserAccessLogAction: {
    UPLOAD_EXAM: 'UPLOAD_EXAM',
    CREATE_REPORT: 'CREATE_REPORT',
  },
}));

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ERole } from '@healthflow/shared';
import { UserAccessLogEventPort } from '@healthflow/observability';
import { MedicalExam } from '../../domain/entities/medical-exam.entity';
import { User } from '../../domain/entities/user.entity';
import { EMedicalExamStatus } from '../../domain/enums/medical-exam-status.enum';
import { MedicalExamRepository } from '../../domain/repositories/medical-exam.repository';
import { CreateReportCommand } from '../commands/create-report.command';
import { CreateReportUseCase } from './create-report.use-case';

const makeDoctor = () => ({
  id: 'doc-1',
  email: 'doc@hospital.com',
  role: ERole.DOCTOR,
});
const makeAttendant = () => ({
  id: 'att-1',
  email: 'att@hospital.com',
  role: ERole.ATTENDANT,
});

const buildDoneExam = (): MedicalExam => {
  const uploader = User.fromPrimitives(makeAttendant());
  const exam = MedicalExam.create({
    fileName: 'chest.dcm',
    mimeType: 'application/dicom',
    fileSize: 1024,
    uploadedBy: uploader,
  });
  exam.attachExamDocumentStorage('path/to/chest.dcm', 'https://example.com/chest.dcm');
  exam.markDone('AI processed');
  return exam;
};

const buildPendingExam = (): MedicalExam => {
  const uploader = User.fromPrimitives(makeAttendant());
  return MedicalExam.create({
    fileName: 'chest.dcm',
    mimeType: 'application/dicom',
    fileSize: 1024,
    uploadedBy: uploader,
  });
};

describe('CreateReportUseCase', () => {
  let useCase: CreateReportUseCase;
  let medicalExamRepository: jest.Mocked<MedicalExamRepository>;
  let userAccessLogEvents: jest.Mocked<UserAccessLogEventPort>;

  beforeEach(() => {
    medicalExamRepository = {
      persist: jest.fn(),
      findById: jest.fn(),
      getBy: jest.fn(),
    } as unknown as jest.Mocked<MedicalExamRepository>;

    userAccessLogEvents = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UserAccessLogEventPort>;

    useCase = new CreateReportUseCase(
      medicalExamRepository,
      userAccessLogEvents,
    );
  });

  it('should create report and return updated exam', async () => {
    const exam = buildDoneExam();
    medicalExamRepository.findById.mockResolvedValue(exam);
    medicalExamRepository.persist.mockImplementation(async (e) => e);

    const command = new CreateReportCommand(
      exam.id,
      'No anomalies',
      makeDoctor(),
    );
    const result = await useCase.execute(command);

    expect(medicalExamRepository.findById).toHaveBeenCalledWith(exam.id);
    expect(medicalExamRepository.persist).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(EMedicalExamStatus.REPORTED);
    expect(result.report).toBe('No anomalies');
    expect(result.reportedBy?.id).toBe(makeDoctor().id);
  });

  it('should publish user access log on success', async () => {
    const exam = buildDoneExam();
    medicalExamRepository.findById.mockResolvedValue(exam);
    medicalExamRepository.persist.mockImplementation(async (e) => e);

    const command = new CreateReportCommand(
      exam.id,
      'No anomalies',
      makeDoctor(),
    );
    await useCase.execute(command);

    expect(userAccessLogEvents.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        module: 'medical',
        useCase: 'CreateReportUseCase',
        userId: makeDoctor().id,
      }),
    );
  });

  it('should throw NotFoundException when exam does not exist', async () => {
    medicalExamRepository.findById.mockResolvedValue(null);

    const command = new CreateReportCommand(
      'non-existent-id',
      'Report',
      makeDoctor(),
    );
    await expect(useCase.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when exam is not in DONE status', async () => {
    const exam = buildPendingExam();
    medicalExamRepository.findById.mockResolvedValue(exam);

    const command = new CreateReportCommand(
      exam.id,
      'Some report',
      makeDoctor(),
    );
    await expect(useCase.execute(command)).rejects.toThrow(BadRequestException);
    expect(medicalExamRepository.persist).not.toHaveBeenCalled();
  });
});
