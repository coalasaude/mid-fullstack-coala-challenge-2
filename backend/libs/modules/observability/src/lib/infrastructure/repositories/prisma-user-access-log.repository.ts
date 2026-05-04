import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserAccessLog } from '../../domain/entities/user-access-log.entity';
import { UserAccessLogRepository } from '../../domain/repositories/user-access-log.repository';
import { UserAccessLogMapper } from '../mappers/user-access-log.mapper';

@Injectable()
export class PrismaUserAccessLogRepository extends UserAccessLogRepository {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async persist(userAccessLog: UserAccessLog): Promise<UserAccessLog> {
    const data = UserAccessLogMapper.toPersistence(userAccessLog);
    const row = await this.prisma.userAccessLog.create({ data });
    return UserAccessLogMapper.toDomain(row);
  }
}
