import { Logger } from '@nestjs/common';
import type { MessageBroker } from './message-broker';
import type { FailedMessagePersistInput } from './failed-message-persist.input';

export interface DlqConsumerConfig {
  mainQueue: string;
  retryQueue: string;
  dlq: string;
  backoffMs: number[];
}

export interface IFailedMessagePersistence {
  persist(input: FailedMessagePersistInput): Promise<void>;
}

export abstract class DeadLetterQueueConsumer<TPayload> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly broker: MessageBroker,
    protected readonly failedMessagePersistence: IFailedMessagePersistence,
  ) {}

  protected abstract parsePayload(body: Buffer): TPayload;

  protected abstract reprocess(payload: TPayload): Promise<void>;

  async start(cfg: DlqConsumerConfig): Promise<void> {
    if (!this.broker.ready) {
      this.logger.warn('Message broker unavailable; DLQ consumer not started');
      return;
    }

    await this.broker.ensureRetryTopology(
      cfg.mainQueue,
      cfg.retryQueue,
      cfg.dlq,
    );

    await this.broker.consumeQueue(
      cfg.dlq,
      async ({ body, headers }) => {
        let payload: TPayload;
        try {
          payload = this.parsePayload(body);
        } catch {
          this.logger.warn(
            `Ignoring malformed DLQ message: ${body.toString().slice(0, 500)}`,
          );
          return;
        }

        const attempts = Number(headers['x-attempts'] ?? 0);
        const firstFailedAt = headers['x-first-failed-at']
          ? new Date(String(headers['x-first-failed-at']))
          : new Date();

        try {
          await this.reprocess(payload);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          const next = attempts + 1;

          if (next > cfg.backoffMs.length) {
            try {
              await this.failedMessagePersistence.persist({
                queue: cfg.mainQueue,
                payload,
                headers: Object.keys(headers).length ? { ...headers } : null,
                errorMessage: err.message,
                errorStack: err.stack ?? null,
                attempts: next,
                firstFailedAt,
              });
            } catch (persistErr) {
              this.logger.error(
                'Failed to persist failed message',
                persistErr instanceof Error
                  ? persistErr.stack
                  : String(persistErr),
              );
            }
            return;
          }

          await this.broker.publishToQueue(cfg.retryQueue, body, {
            headers: {
              ...headers,
              'x-attempts': next,
              'x-first-failed-at': firstFailedAt.toISOString(),
            },
            expirationMs: cfg.backoffMs[next - 1],
          });
        }
      },
      { prefetch: 5 },
    );

    this.logger.log(`DLQ consumer subscribed to "${cfg.dlq}"`);
  }
}
