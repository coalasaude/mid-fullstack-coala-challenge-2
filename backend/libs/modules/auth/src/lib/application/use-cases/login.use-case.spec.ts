import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ERole } from '@healthflow/shared';
import { IPasswordHasherProvider } from '@healthflow/shared';
import { Email } from '../../domain/value-objects/email';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { LoginUseCase } from './login.use-case';
import { LoginCommand } from '../commands/login.command';

const RAW_EMAIL = 'doctor@hospital.com';
const RAW_PASSWORD = 'StrongPass1!';

const makeCommand = (email = RAW_EMAIL, password = RAW_PASSWORD) =>
  new LoginCommand(email, password);

const makeUser = () =>
  User.create({
    email: Email.create(RAW_EMAIL),
    passwordHash: 'stored_hash',
    role: ERole.DOCTOR,
  });

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasherProvider>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      persist: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<IPasswordHasherProvider>;

    jwtService = {
      sign: jest.fn().mockReturnValue('jwt.token.here'),
    } as unknown as jest.Mocked<JwtService>;

    useCase = new LoginUseCase(userRepository, passwordHasher, jwtService);
  });

  it('should return access_token and user info on valid credentials', async () => {
    const user = makeUser();
    userRepository.findByEmail.mockResolvedValue(user);
    userRepository.persist.mockResolvedValue(user);

    const result = await useCase.execute(makeCommand());

    expect(passwordHasher.compare).toHaveBeenCalledWith(
      RAW_PASSWORD,
      'stored_hash',
    );
    expect(jwtService.sign).toHaveBeenCalledWith({
      id: user.id,
      email: user.email.value,
      role: user.role,
    });
    expect(result.access_token).toBe('jwt.token.here');
    expect(result.email).toBe(RAW_EMAIL);
  });

  it('should call persist to update lastAccessAt after successful login', async () => {
    const user = makeUser();
    userRepository.findByEmail.mockResolvedValue(user);
    userRepository.persist.mockResolvedValue(user);

    await useCase.execute(makeCommand());

    expect(userRepository.persist).toHaveBeenCalledTimes(1);
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(makeCommand())).rejects.toThrow(
      UnauthorizedException,
    );
    expect(passwordHasher.compare).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    const user = makeUser();
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute(makeCommand())).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
