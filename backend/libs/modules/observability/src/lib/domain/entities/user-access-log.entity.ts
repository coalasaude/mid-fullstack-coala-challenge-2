import { Entity } from '@healthflow/shared';
import { randomUUID } from 'crypto';

export interface UserAccessLogProps {
  id: string;
  userId: string;
  module: string;
  useCase: string;
  action: string;
  description: string;
  occurredAt: Date;
  createdAt: Date;
}

export class UserAccessLog extends Entity<UserAccessLogProps> {
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
  }): UserAccessLog {
    return new UserAccessLog({
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
