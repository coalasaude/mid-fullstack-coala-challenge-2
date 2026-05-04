export interface ConsumedMessage {
  body: Buffer;
  headers: Record<string, unknown>;
}

export interface PublishOptions {
  headers?: Record<string, unknown>;
  expirationMs?: number;
}

export abstract class MessageBroker {
  abstract get ready(): boolean;

  abstract connect(): Promise<void>;

  abstract disconnect(): Promise<void>;

  abstract ensureRetryTopology(
    mainQueue: string,
    retryQueue: string,
    deadLetterQueue: string,
  ): Promise<void>;

  abstract publishToQueue(
    queue: string,
    body: Buffer,
    options?: PublishOptions,
  ): Promise<void>;

  abstract consumeQueue(
    queue: string,
    handler: (message: ConsumedMessage) => Promise<void>,
    options?: { prefetch?: number },
  ): Promise<void>;
}
