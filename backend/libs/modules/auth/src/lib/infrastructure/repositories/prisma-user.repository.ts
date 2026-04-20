import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Option } from '@healthflow/shared';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async persist(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);
    const row = await this.prisma.user.upsert({
      where: { id: user.id },
      create: data,
      update: data,
    });
    return UserMapper.toDomain(row);
  }

  async findByEmail(email: Email): Promise<Option<User>> {
    const row = await this.prisma.user.findUnique({
      where: { email: email.value },
    });
    return row ? UserMapper.toDomain(row) : null;
  }
}
