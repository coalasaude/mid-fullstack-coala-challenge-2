import { Injectable } from '@nestjs/common';
import { UserAccess } from '../../domain/entities/user-access.entity';
import { UserAccessRepository } from '../../domain/repositories/user-access.repository';
import { UserAccessEventDto } from '../dtos/user-access-event.dto';

@Injectable()
export class RegisterUserAccessUseCase {
  constructor(private readonly userAccessRepository: UserAccessRepository) {}

  async execute(event: UserAccessEventDto): Promise<UserAccess> {
    const userAccess = UserAccess.create({
      userId: event.userId,
      module: event.module,
      useCase: event.useCase,
      action: event.action,
      description: event.description,
      occurredAt: new Date(event.occurredAt),
    });

    return this.userAccessRepository.persist(userAccess);
  }
}
