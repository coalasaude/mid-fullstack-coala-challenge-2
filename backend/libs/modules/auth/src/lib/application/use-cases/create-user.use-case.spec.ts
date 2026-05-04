import { ConflictException } from '@nestjs/common';
import { ERole } from '@healthflow/shared';
import { Email } from '../../domain/value-objects/email';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { IPasswordHasherProvider } from '@healthflow/shared';
import { CreateUserUseCase } from './create-user.use-case';
import { CreateUserCommand } from '../commands/create-user.command';

const makeCommand = (
  email = 'attendant@hospital.com',
  role: ERole = ERole.ATTENDANT,
) => new CreateUserCommand(email, 'StrongPass1!', role);

const makePersistedUser = (email: string, role: ERole) =>
  User.create({
    email: Email.create(email),
    passwordHash: 'hashed_password',
    role,
  });

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasherProvider>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      persist: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    passwordHasher = {
      hash: jest.fn().mockResolvedValue('hashed_password'),
      compare: jest.fn(),
    } as unknown as jest.Mocked<IPasswordHasherProvider>;

    useCase = new CreateUserUseCase(userRepository, passwordHasher);
  });

  it('should create and return a new user', async () => {
    const command = makeCommand();
    const persistedUser = makePersistedUser(command.email.value, command.role);

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.persist.mockResolvedValue(persistedUser);

    const result = await useCase.execute(command);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(command.email);
    expect(passwordHasher.hash).toHaveBeenCalledWith('StrongPass1!');
    expect(userRepository.persist).toHaveBeenCalledTimes(1);
    expect(result.email).toBe(command.email.value);
    expect(result.role).toBe(command.role);
    expect(result.id).toBeDefined();
  });

  it('should throw ConflictException when email already exists', async () => {
    const command = makeCommand();
    const existingUser = makePersistedUser(
      command.email.value,
      ERole.ATTENDANT,
    );

    userRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(useCase.execute(command)).rejects.toThrow(ConflictException);
    expect(userRepository.persist).not.toHaveBeenCalled();
  });
});
