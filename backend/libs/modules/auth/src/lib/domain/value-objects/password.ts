import { ValueObject } from '@healthflow/shared';

interface PasswordProps {
  value: string;
}

// Minimum 8 characters; at least one upper, lower, digit, special
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

export class InvalidPasswordError extends Error {
  constructor(value: string) {
    super(`Invalid password: "${value}"`);
    this.name = 'InvalidPasswordError';
  }
}

export class Password extends ValueObject<PasswordProps> {
  private constructor(props: PasswordProps) {
    super(props);
  }

  static create(value: string): Password {
    const trimmed = value.trim();
    if (!PASSWORD_REGEX.test(trimmed)) {
      throw new InvalidPasswordError(value);
    }
    return new Password({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }

  override toString(): string {
    return this.props.value;
  }
}
