import { ERole } from '@healthflow/shared';
import { User } from './user.entity';

const makeUser = (role: ERole = ERole.DOCTOR) =>
  User.fromPrimitives({ id: 'user-1', email: 'user@hospital.com', role });

describe('User (medical)', () => {
  describe('fromPrimitives', () => {
    it('should create a user with the given primitives', () => {
      const user = makeUser();
      expect(user.id).toBe('user-1');
      expect(user.email).toBe('user@hospital.com');
      expect(user.role).toBe(ERole.DOCTOR);
    });
  });

  describe('isDoctor', () => {
    it('should return true for DOCTOR role', () => {
      expect(makeUser(ERole.DOCTOR).isDoctor()).toBe(true);
    });

    it('should return false for ATTENDANT role', () => {
      expect(makeUser(ERole.ATTENDANT).isDoctor()).toBe(false);
    });
  });

  describe('isAttendant', () => {
    it('should return true for ATTENDANT role', () => {
      expect(makeUser(ERole.ATTENDANT).isAttendant()).toBe(true);
    });

    it('should return false for DOCTOR role', () => {
      expect(makeUser(ERole.DOCTOR).isAttendant()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same instance', () => {
      const user = makeUser();
      expect(user.equals(user)).toBe(true);
    });

    it('should return true for users with same id', () => {
      const a = User.fromPrimitives({
        id: 'same',
        email: 'a@x.com',
        role: ERole.DOCTOR,
      });
      const b = User.fromPrimitives({
        id: 'same',
        email: 'b@x.com',
        role: ERole.ATTENDANT,
      });
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for users with different ids', () => {
      const a = User.fromPrimitives({
        id: 'id-1',
        email: 'a@x.com',
        role: ERole.DOCTOR,
      });
      const b = User.fromPrimitives({
        id: 'id-2',
        email: 'a@x.com',
        role: ERole.DOCTOR,
      });
      expect(a.equals(b)).toBe(false);
    });
  });
});
