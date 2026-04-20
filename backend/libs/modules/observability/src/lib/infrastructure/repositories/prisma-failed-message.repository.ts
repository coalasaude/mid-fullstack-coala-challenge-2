import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FailedMessage } from '../../domain/entities/failed-message.entity';
import type { FailedMessagePersistInput } from '@healthflow/infra';
import { FailedMessageRepository } from '../../domain/repositories/failed-message.repository';
import { FailedMessageMapper } from '../mappers/failed-message.mapper';

@Injectable()
export class PrismaFailedMessageRepository extends FailedMessageRepository {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async persist(input: FailedMessagePersistInput): Promise<void> {
    const entity = FailedMessage.create(input);
    const data = FailedMessageMapper.toPersistence(entity);
    await this.prisma.failedMessage.create({ data });
  }
}
