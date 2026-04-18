import { ConflictException, Injectable } from '@nestjs/common';
import { IPasswordHasherProvider } from '@healthflow/shared';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserCommand } from '../commands/create-user.command';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: IPasswordHasherProvider,
  ) {}

  async execute(command: CreateUserCommand) {
    const email = command.email;

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await this.passwordHasher.hash(command.password.value);
    const user = await this.userRepository.create({
      email,
      passwordHash,
      role: command.role,
    });

    return {
      id: user.id,
      email: user.email.value,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
