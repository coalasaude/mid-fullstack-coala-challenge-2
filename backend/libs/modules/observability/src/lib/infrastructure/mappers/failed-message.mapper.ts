import { Prisma, type FailedMessage as PrismaFailedMessage } from '@prisma/client';
import { FailedMessage } from '../../domain/entities/failed-message.entity';

export class FailedMessageMapper {
  static toPersistence(
    entity: FailedMessage,
  ): Prisma.FailedMessageUncheckedCreateInput {
    return {
      id: entity.id,
      queue: entity.queue,
      payload: entity.payload as Prisma.InputJsonValue,
      headers:
        entity.headers === null || entity.headers === undefined
          ? undefined
          : (entity.headers as Prisma.InputJsonValue),
      errorMessage: entity.errorMessage,
      errorStack: entity.errorStack,
      attempts: entity.attempts,
      firstFailedAt: entity.firstFailedAt,
      lastFailedAt: entity.lastFailedAt,
      createdAt: entity.createdAt,
    };
  }

  static toDomain(row: PrismaFailedMessage): FailedMessage {
    return new FailedMessage({
      id: row.id,
      queue: row.queue,
      payload: row.payload,
      headers: row.headers,
      errorMessage: row.errorMessage,
      errorStack: row.errorStack,
      attempts: row.attempts,
      firstFailedAt: row.firstFailedAt,
      lastFailedAt: row.lastFailedAt,
      createdAt: row.createdAt,
    });
  }
}
