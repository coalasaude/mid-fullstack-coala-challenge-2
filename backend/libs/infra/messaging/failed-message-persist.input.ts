export interface FailedMessagePersistInput {
  queue: string;
  payload: unknown;
  headers: Record<string, unknown> | null;
  errorMessage: string;
  errorStack: string | null;
  attempts: number;
  firstFailedAt: Date;
}
