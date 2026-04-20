import { Injectable } from '@nestjs/common';
import { UserAccessLog } from '../../domain/entities/user-access-log.entity';
import { UserAccessLogRepository } from '../../domain/repositories/user-access-log.repository';
import { UserAccessLogEventDto } from '../dtos/user-access-log-event.dto';

@Injectable()
export class RegisterUserAccessLogUseCase {
  constructor(
    private readonly userAccessLogRepository: UserAccessLogRepository,
  ) {}

  async execute(event: UserAccessLogEventDto): Promise<UserAccessLog> {
    const userAccessLog = UserAccessLog.create({
      userId: event.userId,
      module: event.module,
      useCase: event.useCase,
      action: event.action,
      description: event.description,
      occurredAt: new Date(event.occurredAt),
    });

    return this.userAccessLogRepository.persist(userAccessLog);
  }
}
