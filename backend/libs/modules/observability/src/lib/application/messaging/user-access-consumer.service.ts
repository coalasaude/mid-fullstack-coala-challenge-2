import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBroker } from '@healthflow/infra';
import { RegisterUserAccessUseCase } from '../use-cases/register-user-access.use-case';
import { UserAccessEventDto } from '../dtos/user-access-event.dto';

@Injectable()
export class UserAccessConsumerService implements OnModuleInit {
  private readonly logger = new Logger(UserAccessConsumerService.name);

  constructor(
    private readonly broker: MessageBroker,
    private readonly configService: ConfigService,
    private readonly registerUserAccess: RegisterUserAccessUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.broker.ready) {
      this.logger.warn(
        'Message broker unavailable; user-access consumer not started',
      );
      return;
    }

    const mainQueue = this.configService.getOrThrow<string>('userAccess.queue');
    const dlq = this.configService.getOrThrow<string>('userAccess.dlq');

    await this.broker.ensureQueueWithDeadLetter(mainQueue, dlq);

    await this.broker.consumeQueue(
      mainQueue,
      async (body) => {
        const parsed = JSON.parse(body.toString()) as UserAccessEventDto;
        if (
          !parsed?.module ||
          !parsed?.useCase ||
          !parsed?.action ||
          !parsed?.userId ||
          !parsed?.description ||
          !parsed?.occurredAt
        ) {
          this.logger.warn(
            `Ignoring malformed user-access event: ${body.toString()}`,
          );
          return;
        }
        await this.registerUserAccess.execute(parsed);
      },
      { prefetch: 10 },
    );
  }
}
