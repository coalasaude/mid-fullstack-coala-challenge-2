import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';

export class LoginCommand {
  private readonly _email: Email;
  private readonly _password: Password;

  constructor(email: string, password: string) {
    if (!email) {
      throw new Error('Email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }
    this._email = Email.create(email);
    this._password = Password.create(password);
  }

  get email(): Email {
    return this._email;
  }

  get password(): Password {
    return this._password;
  }
}
