import { Entity } from '@healthflow/shared';
import type { FailedMessagePersistInput } from '@healthflow/infra';
import { randomUUID } from 'crypto';

export interface FailedMessageProps {
  id: string;
  queue: string;
  payload: unknown;
  headers: unknown | null;
  errorMessage: string;
  errorStack: string | null;
  attempts: number;
  firstFailedAt: Date;
  lastFailedAt: Date;
  createdAt: Date;
}

export class FailedMessage extends Entity<FailedMessageProps> {
  get queue(): string {
    return this.props.queue;
  }

  get payload(): unknown {
    return this.props.payload;
  }

  get headers(): unknown | null {
    return this.props.headers;
  }

  get errorMessage(): string {
    return this.props.errorMessage;
  }

  get errorStack(): string | null {
    return this.props.errorStack;
  }

  get attempts(): number {
    return this.props.attempts;
  }

  get firstFailedAt(): Date {
    return this.props.firstFailedAt;
  }

  get lastFailedAt(): Date {
    return this.props.lastFailedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static create(input: FailedMessagePersistInput): FailedMessage {
    const now = new Date();
    return new FailedMessage({
      id: randomUUID(),
      queue: input.queue,
      payload: input.payload,
      headers: input.headers,
      errorMessage: input.errorMessage,
      errorStack: input.errorStack,
      attempts: input.attempts,
      firstFailedAt: input.firstFailedAt,
      lastFailedAt: now,
      createdAt: now,
    });
  }
}
