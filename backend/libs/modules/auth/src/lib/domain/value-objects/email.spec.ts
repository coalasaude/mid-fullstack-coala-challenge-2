import { Email, InvalidEmailError } from './email';

describe('Email', () => {
  describe('create', () => {
    it('should create a valid email and normalize to lowercase', () => {
      const email = Email.create('User@Example.COM');
      expect(email.value).toBe('user@example.com');
    });

    it('should trim whitespace before validating', () => {
      const email = Email.create('  test@domain.com  ');
      expect(email.value).toBe('test@domain.com');
    });

    it('should throw InvalidEmailError for email without @', () => {
      expect(() => Email.create('invalidemail.com')).toThrow(InvalidEmailError);
    });

    it('should throw InvalidEmailError for email without domain', () => {
      expect(() => Email.create('user@')).toThrow(InvalidEmailError);
    });

    it('should throw InvalidEmailError for empty string', () => {
      expect(() => Email.create('')).toThrow(InvalidEmailError);
    });

    it('should throw InvalidEmailError for string with spaces', () => {
      expect(() => Email.create('user name@domain.com')).toThrow(
        InvalidEmailError,
      );
    });
  });

  describe('value', () => {
    it('should return normalized email', () => {
      const email = Email.create('DOCTOR@HOSPITAL.ORG');
      expect(email.value).toBe('doctor@hospital.org');
    });
  });

  describe('toString', () => {
    it('should return email string representation', () => {
      const email = Email.create('user@example.com');
      expect(email.toString()).toBe('user@example.com');
    });
  });

  describe('equals', () => {
    it('should return true for two emails with same value', () => {
      const a = Email.create('user@example.com');
      const b = Email.create('user@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for two emails with different values', () => {
      const a = Email.create('user@example.com');
      const b = Email.create('other@example.com');
      expect(a.equals(b)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const email = Email.create('user@example.com');
      expect(email.equals(undefined)).toBe(false);
    });
  });
});
