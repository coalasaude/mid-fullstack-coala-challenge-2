import { ERole } from '@healthflow/shared';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';

export class CreateUserCommand {
  private readonly _email: Email;
  private readonly _password: Password;
  private readonly _role: ERole;

  constructor(email: string, password: string, role: ERole) {
    if (!email) {
      throw new Error('Email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }
    if (!role) {
      throw new Error('Role is required');
    }
    this._email = Email.create(email);
    this._password = Password.create(password);
    this._role = role;
  }

  get email(): Email {
    return this._email;
  }

  get password(): Password {
    return this._password;
  }

  get role(): ERole {
    return this._role;
  }
}
