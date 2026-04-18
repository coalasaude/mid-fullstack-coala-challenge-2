import { Entity } from '@healthflow/shared';
import { randomUUID } from 'crypto';

export interface UserAccessProps {
  id: string;
  userId: string;
  module: string;
  useCase: string;
  action: string;
  description: string;
  occurredAt: Date;
  createdAt: Date;
}

export class UserAccess extends Entity<UserAccessProps> {
  get userId(): string {
    return this.props.userId;
  }

  get module(): string {
    return this.props.module;
  }

  get useCase(): string {
    return this.props.useCase;
  }

  get action(): string {
    return this.props.action;
  }

  get description(): string {
    return this.props.description;
  }

  get occurredAt(): Date {
    return this.props.occurredAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static create(input: {
    userId: string;
    module: string;
    useCase: string;
    action: string;
    description: string;
    occurredAt: Date;
  }): UserAccess {
    return new UserAccess({
      id: randomUUID(),
      userId: input.userId,
      module: input.module,
      useCase: input.useCase,
      action: input.action,
      description: input.description,
      occurredAt: input.occurredAt,
      createdAt: new Date(),
    });
  }
}
