import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    usersService = { findByEmail: jest.fn() };
    jwtService = { signAsync: jest.fn().mockResolvedValue('jwt.token.here') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('throws UnauthorizedException when user does not exist', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'x@y.com', password: '123456' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when password does not match', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'x@y.com',
      password: await bcrypt.hash('correct', 10),
      name: 'User',
      role: Role.ATTENDANT,
    });

    await expect(
      service.login({ email: 'x@y.com', password: 'wrong!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('signs a JWT with sub/email/role on success', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'x@y.com',
      password: await bcrypt.hash('s3cret1', 10),
      name: 'User',
      role: Role.DOCTOR,
    });

    const result = await service.login({
      email: 'x@y.com',
      password: 's3cret1',
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'u1',
      email: 'x@y.com',
      role: Role.DOCTOR,
    });
    expect(result.accessToken).toBe('jwt.token.here');
    expect(result.user).toEqual({
      id: 'u1',
      name: 'User',
      email: 'x@y.com',
      role: Role.DOCTOR,
    });
  });
});
