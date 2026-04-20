import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeadLetterQueueConsumer, MessageBroker } from '@healthflow/infra';
import { RegisterUserAccessLogUseCase } from '../use-cases/register-user-access-log.use-case';
import { UserAccessLogEventDto } from '../dtos/user-access-log-event.dto';
import { FailedMessageRepository } from '../../domain/repositories/failed-message.repository';

@Injectable()
export class UserAccessLogDlqConsumer
  extends DeadLetterQueueConsumer<UserAccessLogEventDto>
  implements OnModuleInit
{
  constructor(
    broker: MessageBroker,
    failedMessageRepository: FailedMessageRepository,
    private readonly configService: ConfigService,
    private readonly registerUserAccessLog: RegisterUserAccessLogUseCase,
  ) {
    super(broker, failedMessageRepository);
  }

  protected parsePayload(body: Buffer): UserAccessLogEventDto {
    const parsed = JSON.parse(body.toString()) as UserAccessLogEventDto;
    if (
      !parsed?.module ||
      !parsed?.useCase ||
      !parsed?.action ||
      !parsed?.userId ||
      !parsed?.description ||
      !parsed?.occurredAt
    ) {
      throw new Error('malformed user-access-log event');
    }
    return parsed;
  }

  protected async reprocess(payload: UserAccessLogEventDto): Promise<void> {
    await this.registerUserAccessLog.execute(payload);
  }

  async onModuleInit(): Promise<void> {
    await this.start({
      mainQueue: this.configService.getOrThrow<string>('userAccessLog.queue'),
      retryQueue: this.configService.getOrThrow<string>(
        'userAccessLog.retryQueue',
      ),
      dlq: this.configService.getOrThrow<string>('userAccessLog.dlq'),
      backoffMs: [5000, 15000, 60000],
    });
  }
}
