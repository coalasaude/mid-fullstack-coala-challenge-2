import { FailedMessage } from './failed-message.entity';

const makeInput = () => ({
  queue: 'exam.processing.dlq',
  payload: { examId: 'exam-123' },
  headers: { 'x-attempts': 3 },
  errorMessage: 'Processing failed',
  errorStack: 'Error: Processing failed\n  at ...',
  attempts: 3,
  firstFailedAt: new Date('2026-04-18T09:00:00Z'),
});

describe('FailedMessage', () => {
  describe('create', () => {
    it('should generate a unique id', () => {
      const msg1 = FailedMessage.create(makeInput());
      const msg2 = FailedMessage.create(makeInput());
      expect(msg1.id).toBeDefined();
      expect(msg2.id).toBeDefined();
      expect(msg1.id).not.toBe(msg2.id);
    });

    it('should store all provided fields', () => {
      const input = makeInput();
      const msg = FailedMessage.create(input);
      expect(msg.queue).toBe(input.queue);
      expect(msg.payload).toEqual(input.payload);
      expect(msg.headers).toEqual(input.headers);
      expect(msg.errorMessage).toBe(input.errorMessage);
      expect(msg.errorStack).toBe(input.errorStack);
      expect(msg.attempts).toBe(input.attempts);
      expect(msg.firstFailedAt).toEqual(input.firstFailedAt);
    });

    it('should set lastFailedAt and createdAt close to now', () => {
      const before = new Date();
      const msg = FailedMessage.create(makeInput());
      const after = new Date();
      expect(msg.lastFailedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(msg.lastFailedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(msg.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(msg.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should handle null headers', () => {
      const msg = FailedMessage.create({ ...makeInput(), headers: null });
      expect(msg.headers).toBeNull();
    });

    it('should handle null errorStack', () => {
      const msg = FailedMessage.create({ ...makeInput(), errorStack: null });
      expect(msg.errorStack).toBeNull();
    });
  });
});
