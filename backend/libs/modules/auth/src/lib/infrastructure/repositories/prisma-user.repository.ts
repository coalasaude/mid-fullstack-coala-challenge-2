import { Injectable } from '@nestjs/common';
import { PrismaService } from '@healthflow/infra';
import { Option, ERole } from '@healthflow/shared';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: {
    email: Email;
    passwordHash: string;
    role: ERole;
  }): Promise<User> {
    const user = User.create(input);
    const row = await this.prisma.user.create({
      data: UserMapper.toPersistence(user),
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
