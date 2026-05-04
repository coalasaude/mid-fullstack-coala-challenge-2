import { Prisma, type UserAccessLog as PrismaUserAccessLog } from '@prisma/client';
import { UserAccessLog } from '../../domain/entities/user-access-log.entity';

export class UserAccessLogMapper {
  static toDomain(row: PrismaUserAccessLog): UserAccessLog {
    return new UserAccessLog({
      id: row.id,
      userId: row.userId,
      module: row.module,
      useCase: row.useCase,
      action: row.action,
      description: row.description,
      occurredAt: row.occurredAt,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(
    userAccessLog: UserAccessLog,
  ): Prisma.UserAccessLogUncheckedCreateInput {
    return {
      id: userAccessLog.id,
      userId: userAccessLog.userId,
      module: userAccessLog.module,
      useCase: userAccessLog.useCase,
      action: userAccessLog.action,
      description: userAccessLog.description,
      occurredAt: userAccessLog.occurredAt,
      createdAt: userAccessLog.createdAt,
    };
  }
}
