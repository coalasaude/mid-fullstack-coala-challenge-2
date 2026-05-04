import { ConflictException, Injectable } from '@nestjs/common';
import { IPasswordHasherProvider } from '@healthflow/shared';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserCommand } from '../commands/create-user.command';
import { CreateUserResponseDto } from '../../presentation/http/dto/create-user-response.dto';

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
    const user = User.create({
      email,
      passwordHash,
      role: command.role,
    });

    const createdUser = await this.userRepository.persist(user);

    return new CreateUserResponseDto({
      id: createdUser.id,
      email: createdUser.email.value,
      role: createdUser.role,
      createdAt: createdUser.createdAt,
    });
  }
}
