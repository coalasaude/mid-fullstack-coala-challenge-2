import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBroker } from '@healthflow/infra';
import { err, ok, Result } from '@healthflow/shared';
import { UserAccessLogEventDto } from '../dtos/user-access-log-event.dto';
import { UserAccessLogEventPort } from '../../domain/ports/user-access-log-event.port';

@Injectable()
export class UserAccessLogEventAdapter extends UserAccessLogEventPort {
  private readonly logger = new Logger(UserAccessLogEventAdapter.name);

  constructor(
    private readonly broker: MessageBroker,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  override async publish(
    event: UserAccessLogEventDto,
  ): Promise<Result<void, Error>> {
    const queue = this.configService.getOrThrow<string>('userAccessLog.queue');

    if (!this.broker.ready) {
      this.logger.warn(
        `Broker unavailable; dropping user-access-log event ${event.module}:${event.useCase}`,
      );
      return ok(undefined);
    }

    try {
      const body = Buffer.from(JSON.stringify(event));
      await this.broker.publishToQueue(queue, body);
      return ok(undefined);
    } catch (error) {
      const errorMessage = `Failed to publish user-access-log event for ${event.module}:${event.useCase}: ${error instanceof Error ? error.message : String(error)}`;
      this.logger.error(errorMessage, error);
      return err(new Error(errorMessage));
    }
  }
}
