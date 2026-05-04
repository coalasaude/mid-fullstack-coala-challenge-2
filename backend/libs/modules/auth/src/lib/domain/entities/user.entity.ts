import { Entity, ERole, Option } from '@healthflow/shared';
import { randomUUID } from 'crypto';
import { Email } from '../value-objects/email';

export interface UserProps {
  id: string;
  email: Email;
  passwordHash: string;
  role: ERole;
  createdAt: Date;
  updatedAt: Date;
  lastAccessAt: Option<Date>;
}

export class User extends Entity<UserProps> {
  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): ERole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get lastAccessAt(): Option<Date> {
    return this.props.lastAccessAt;
  }

  static create(input: {
    email: Email;
    passwordHash: string;
    role: ERole;
  }): User {
    return new User({
      id: randomUUID(),
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessAt: null,
    });
  }

  login() {
    this.props.lastAccessAt = new Date();
    this.props.updatedAt = new Date();
  }
}
