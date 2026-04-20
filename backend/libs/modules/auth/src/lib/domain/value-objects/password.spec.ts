import { InvalidPasswordError, Password } from './password';

const VALID_PASSWORD = 'StrongPass1!';

describe('Password', () => {
  describe('create', () => {
    it('should create a valid password', () => {
      const password = Password.create(VALID_PASSWORD);
      expect(password.value).toBe(VALID_PASSWORD);
    });

    it('should trim whitespace before validating', () => {
      const password = Password.create(`  ${VALID_PASSWORD}  `);
      expect(password.value).toBe(VALID_PASSWORD);
    });

    it('should throw InvalidPasswordError when too short', () => {
      expect(() => Password.create('Ab1!')).toThrow(InvalidPasswordError);
    });

    it('should throw InvalidPasswordError when missing uppercase', () => {
      expect(() => Password.create('weakpass1!')).toThrow(InvalidPasswordError);
    });

    it('should throw InvalidPasswordError when missing lowercase', () => {
      expect(() => Password.create('WEAKPASS1!')).toThrow(InvalidPasswordError);
    });

    it('should throw InvalidPasswordError when missing digit', () => {
      expect(() => Password.create('WeakPass!!')).toThrow(InvalidPasswordError);
    });

    it('should throw InvalidPasswordError when missing special character', () => {
      expect(() => Password.create('WeakPass11')).toThrow(InvalidPasswordError);
    });
  });

  describe('equals', () => {
    it('should return true for two passwords with same value', () => {
      const a = Password.create(VALID_PASSWORD);
      const b = Password.create(VALID_PASSWORD);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for two passwords with different values', () => {
      const a = Password.create(VALID_PASSWORD);
      const b = Password.create('AnotherPass1!');
      expect(a.equals(b)).toBe(false);
    });
  });
});
