import { UserAccessLog } from '../../domain/entities/user-access-log.entity';
import { UserAccessLogRepository } from '../../domain/repositories/user-access-log.repository';
import { UserAccessLogEventDto } from '../dtos/user-access-log-event.dto';
import { RegisterUserAccessLogUseCase } from './register-user-access-log.use-case';

const makeEvent = (): UserAccessLogEventDto => ({
  userId: 'user-1',
  module: 'medical',
  useCase: 'UploadExamUseCase',
  action: 'UPLOAD_EXAM',
  description: 'Uploaded exam by user-1',
  occurredAt: new Date().toISOString(),
});

describe('RegisterUserAccessLogUseCase', () => {
  let useCase: RegisterUserAccessLogUseCase;
  let userAccessLogRepository: jest.Mocked<UserAccessLogRepository>;

  beforeEach(() => {
    userAccessLogRepository = {
      persist: jest.fn(),
    } as unknown as jest.Mocked<UserAccessLogRepository>;

    useCase = new RegisterUserAccessLogUseCase(userAccessLogRepository);
  });

  it('should persist and return a UserAccessLog entity', async () => {
    const event = makeEvent();
    const log = UserAccessLog.create({
      userId: event.userId,
      module: event.module,
      useCase: event.useCase,
      action: event.action,
      description: event.description,
      occurredAt: new Date(event.occurredAt),
    });
    userAccessLogRepository.persist.mockResolvedValue(log);

    const result = await useCase.execute(event);

    expect(userAccessLogRepository.persist).toHaveBeenCalledTimes(1);
    const persisted = userAccessLogRepository.persist.mock.calls[0][0];
    expect(persisted.userId).toBe(event.userId);
    expect(persisted.module).toBe(event.module);
    expect(persisted.useCase).toBe(event.useCase);
    expect(persisted.action).toBe(event.action);
    expect(persisted.description).toBe(event.description);
    expect(result).toBe(log);
  });

  it('should parse occurredAt string to Date', async () => {
    const isoString = '2026-04-18T10:30:00.000Z';
    const event = { ...makeEvent(), occurredAt: isoString };
    userAccessLogRepository.persist.mockImplementation(async (e) => e);

    await useCase.execute(event);

    const persisted = userAccessLogRepository.persist.mock.calls[0][0];
    expect(persisted.occurredAt).toEqual(new Date(isoString));
  });
});
