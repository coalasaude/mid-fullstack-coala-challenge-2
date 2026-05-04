import { UserAccessLog } from './user-access-log.entity';

const makeInput = () => ({
  userId: 'user-1',
  module: 'medical',
  useCase: 'UploadExamUseCase',
  action: 'UPLOAD_EXAM',
  description: 'Uploaded exam by user-1',
  occurredAt: new Date('2026-04-18T10:00:00Z'),
});

describe('UserAccessLog', () => {
  describe('create', () => {
    it('should generate a unique id', () => {
      const log1 = UserAccessLog.create(makeInput());
      const log2 = UserAccessLog.create(makeInput());
      expect(log1.id).toBeDefined();
      expect(log2.id).toBeDefined();
      expect(log1.id).not.toBe(log2.id);
    });

    it('should store all provided fields', () => {
      const input = makeInput();
      const log = UserAccessLog.create(input);
      expect(log.userId).toBe(input.userId);
      expect(log.module).toBe(input.module);
      expect(log.useCase).toBe(input.useCase);
      expect(log.action).toBe(input.action);
      expect(log.description).toBe(input.description);
      expect(log.occurredAt).toEqual(input.occurredAt);
    });

    it('should set createdAt close to now', () => {
      const before = new Date();
      const log = UserAccessLog.create(makeInput());
      const after = new Date();
      expect(log.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(log.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
