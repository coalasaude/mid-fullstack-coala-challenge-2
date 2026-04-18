import { Prisma, type UserAccess as PrismaUserAccess } from '@prisma/client';
import { UserAccess } from '../../domain/entities/user-access.entity';

export class UserAccessMapper {
  static toDomain(row: PrismaUserAccess): UserAccess {
    return new UserAccess({
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
    userAccess: UserAccess,
  ): Prisma.UserAccessUncheckedCreateInput {
    return {
      id: userAccess.id,
      userId: userAccess.userId,
      module: userAccess.module,
      useCase: userAccess.useCase,
      action: userAccess.action,
      description: userAccess.description,
      occurredAt: userAccess.occurredAt,
      createdAt: userAccess.createdAt,
    };
  }
}
