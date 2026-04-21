import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('hashes the password before storing and strips it from the response', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'u1',
      ...data,
    }));

    const result = await service.create({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'plaintext',
      role: Role.ATTENDANT,
    });

    const created = prisma.user.create.mock.calls[0][0].data;
    expect(created.password).not.toBe('plaintext');
    expect(await bcrypt.compare('plaintext', created.password)).toBe(true);
    expect(result).not.toHaveProperty('password');
    expect(result.email).toBe('alice@example.com');
  });

  it('throws ConflictException when the email is already registered', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'plaintext',
        role: Role.DOCTOR,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
