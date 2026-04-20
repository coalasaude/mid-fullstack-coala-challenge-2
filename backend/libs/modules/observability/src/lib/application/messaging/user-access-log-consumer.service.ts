import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBroker } from '@healthflow/infra';
import { RegisterUserAccessLogUseCase } from '../use-cases/register-user-access-log.use-case';
import { UserAccessLogEventDto } from '../dtos/user-access-log-event.dto';

@Injectable()
export class UserAccessLogConsumerService implements OnModuleInit {
  private readonly logger = new Logger(UserAccessLogConsumerService.name);

  constructor(
    private readonly broker: MessageBroker,
    private readonly configService: ConfigService,
    private readonly registerUserAccessLog: RegisterUserAccessLogUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.broker.ready) {
      this.logger.warn(
        'Message broker unavailable; user-access-log consumer not started',
      );
      return;
    }

    const mainQueue = this.configService.getOrThrow<string>(
      'userAccessLog.queue',
    );
    const retryQueue = this.configService.getOrThrow<string>(
      'userAccessLog.retryQueue',
    );
    const dlq = this.configService.getOrThrow<string>('userAccessLog.dlq');

    await this.broker.ensureRetryTopology(mainQueue, retryQueue, dlq);

    await this.broker.consumeQueue(
      mainQueue,
      async ({ body }) => {
        const parsed = JSON.parse(body.toString()) as UserAccessLogEventDto;
        if (
          !parsed?.module ||
          !parsed?.useCase ||
          !parsed?.action ||
          !parsed?.userId ||
          !parsed?.description ||
          !parsed?.occurredAt
        ) {
          const preview = body.toString().slice(0, 120);
          this.logger.warn(
            `Malformed user-access-log event (preview): ${preview}${body.length > 120 ? '…' : ''}`,
          );
          return;
        }
        await this.registerUserAccessLog.execute(parsed);
      },
      { prefetch: 10 },
    );
  }
}
