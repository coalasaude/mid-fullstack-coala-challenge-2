import { Role as PrismaRole, User as PrismaUser } from '@prisma/client';
import { ERole, Option } from '@healthflow/shared';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email';

export class UserMapper {
  static toDomain(row: PrismaUser): User {
    return new User({
      id: row.id,
      email: Email.create(row.email),
      passwordHash: row.password,
      role: row.role as ERole,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastAccessAt: row.lastAccessAt,
    });
  }

  static toPersistence(user: User): {
    id: string;
    email: string;
    password: string;
    role: PrismaRole;
    createdAt: Date;
    updatedAt: Date;
    lastAccessAt: Option<Date>;
  } {
    return {
      id: user.id,
      email: user.email.value,
      password: user.passwordHash,
      role: user.role as PrismaRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastAccessAt: user.lastAccessAt,
    };
  }
}
