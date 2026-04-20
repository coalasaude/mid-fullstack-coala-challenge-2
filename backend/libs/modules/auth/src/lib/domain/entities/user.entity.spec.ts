import { ERole } from '@healthflow/shared';
import { Email } from '../value-objects/email';
import { User } from './user.entity';

const makeUser = (overrides?: Partial<{ email: string; role: ERole }>) =>
  User.create({
    email: Email.create(overrides?.email ?? 'doctor@hospital.com'),
    passwordHash: 'hashed_password',
    role: overrides?.role ?? ERole.DOCTOR,
  });

describe('User (auth)', () => {
  describe('create', () => {
    it('should create a user with a generated id', () => {
      const user = makeUser();
      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
    });

    it('should set email, passwordHash and role', () => {
      const user = makeUser({
        email: 'attendant@hospital.com',
        role: ERole.ATTENDANT,
      });
      expect(user.email.value).toBe('attendant@hospital.com');
      expect(user.passwordHash).toBe('hashed_password');
      expect(user.role).toBe(ERole.ATTENDANT);
    });

    it('should initialize lastAccessAt as null', () => {
      const user = makeUser();
      expect(user.lastAccessAt).toBeNull();
    });

    it('should set createdAt and updatedAt close to now', () => {
      const before = new Date();
      const user = makeUser();
      const after = new Date();
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('login', () => {
    it('should update lastAccessAt and updatedAt on login', () => {
      const user = makeUser();
      const beforeLogin = new Date();
      user.login();
      expect(user.lastAccessAt).not.toBeNull();
      expect(user.lastAccessAt!.getTime()).toBeGreaterThanOrEqual(
        beforeLogin.getTime(),
      );
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeLogin.getTime(),
      );
    });
  });

  describe('equals', () => {
    it('should return true when comparing same instance', () => {
      const user = makeUser();
      expect(user.equals(user)).toBe(true);
    });

    it('should return true when comparing users with same id', () => {
      const user = makeUser();
      const sameUser = Object.create(Object.getPrototypeOf(user));
      Object.defineProperty(sameUser, 'props', {
        value: { ...user['props'] },
        writable: true,
      });
      expect(user.equals(sameUser)).toBe(true);
    });

    it('should return false when comparing with undefined', () => {
      const user = makeUser();
      expect(user.equals(undefined)).toBe(false);
    });
  });
});
