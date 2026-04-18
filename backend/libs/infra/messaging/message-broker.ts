export abstract class MessageBroker {
  abstract get ready(): boolean;

  abstract connect(): Promise<void>;

  abstract disconnect(): Promise<void>;

  abstract ensureQueueWithDeadLetter(
    mainQueue: string,
    deadLetterQueue: string,
  ): Promise<void>;

  abstract publishToQueue(queue: string, body: Buffer): Promise<void>;

  abstract consumeQueue(
    queue: string,
    handler: (body: Buffer) => Promise<void>,
    options?: { prefetch?: number },
  ): Promise<void>;
}
