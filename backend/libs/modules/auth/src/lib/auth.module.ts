import { Module } from '@nestjs/common';
import { ProvidersModule } from '@healthflow/providers';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { UserRepository } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { AuthController } from './presentation/http/controllers/auth.controller';
import { UsersController } from './presentation/http/controllers/users.controller';

@Module({
  imports: [ProvidersModule],
  controllers: [AuthController, UsersController],
  providers: [
    { provide: UserRepository, useClass: PrismaUserRepository },
    CreateUserUseCase,
    LoginUseCase,
  ],
})
export class AuthModule {}
