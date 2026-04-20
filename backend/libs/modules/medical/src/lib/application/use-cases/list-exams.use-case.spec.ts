import { ERole } from '@healthflow/shared';
import { MedicalExam } from '../../domain/entities/medical-exam.entity';
import { User } from '../../domain/entities/user.entity';
import { EMedicalExamStatus } from '../../domain/enums/medical-exam-status.enum';
import { MedicalExamRepository } from '../../domain/repositories/medical-exam.repository';
import { ListExamsCommand } from '../commands/list-exams.command';
import { ListExamsUseCase } from './list-exams.use-case';

const makeAttendant = () => ({
  id: 'att-1',
  email: 'att@hospital.com',
  role: ERole.ATTENDANT,
});
const makeDoctor = () => ({
  id: 'doc-1',
  email: 'doc@hospital.com',
  role: ERole.DOCTOR,
});

const buildExam = (status: EMedicalExamStatus): MedicalExam => {
  const uploader = User.fromPrimitives(makeAttendant());
  const exam = MedicalExam.create({
    fileName: 'exam.dcm',
    mimeType: 'application/dicom',
    fileSize: 512,
    uploadedBy: uploader,
  });
  exam.attachExamDocumentStorage('path/to/exam.dcm', 'https://example.com/exam.dcm');
  if (status === EMedicalExamStatus.PROCESSING) exam.toProcessing();
  if (status === EMedicalExamStatus.DONE) {
    exam.toProcessing();
    exam.markDone('OK');
  }
  if (status === EMedicalExamStatus.ERROR) exam.markError('Failed');
  return exam;
};

describe('ListExamsUseCase', () => {
  let useCase: ListExamsUseCase;
  let medicalExamRepository: jest.Mocked<MedicalExamRepository>;

  beforeEach(() => {
    medicalExamRepository = {
      persist: jest.fn(),
      findById: jest.fn(),
      getBy: jest.fn(),
    } as unknown as jest.Mocked<MedicalExamRepository>;

    useCase = new ListExamsUseCase(medicalExamRepository);
  });

  it('should return all exams for an attendant', async () => {
    const exams = [
      buildExam(EMedicalExamStatus.PENDING),
      buildExam(EMedicalExamStatus.DONE),
    ];
    medicalExamRepository.getBy.mockResolvedValue(exams);

    const command = new ListExamsCommand(makeAttendant());
    const result = await useCase.execute(command);

    expect(medicalExamRepository.getBy).toHaveBeenCalledWith(
      {},
      { createdAt: 'desc' },
    );
    expect(result).toHaveLength(2);
  });

  it('should filter only DONE exams for a doctor', async () => {
    const doneExams = [buildExam(EMedicalExamStatus.DONE)];
    medicalExamRepository.getBy.mockResolvedValue(doneExams);

    const command = new ListExamsCommand(makeDoctor());
    const result = await useCase.execute(command);

    expect(medicalExamRepository.getBy).toHaveBeenCalledWith(
      { status: EMedicalExamStatus.DONE },
      { createdAt: 'desc' },
    );
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(EMedicalExamStatus.DONE);
  });

  it('should return an empty list when no exams exist', async () => {
    medicalExamRepository.getBy.mockResolvedValue([]);

    const command = new ListExamsCommand(makeAttendant());
    const result = await useCase.execute(command);

    expect(result).toHaveLength(0);
  });

  it('should map exam fields correctly in the response', async () => {
    const exam = buildExam(EMedicalExamStatus.DONE);
    medicalExamRepository.getBy.mockResolvedValue([exam]);

    const command = new ListExamsCommand(makeAttendant());
    const result = await useCase.execute(command);

    expect(result[0].id).toBe(exam.id);
    expect(result[0].fileName).toBe('exam.dcm');
    expect(result[0].uploadedBy.id).toBe(makeAttendant().id);
  });
});
