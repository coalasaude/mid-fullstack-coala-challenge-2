import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

function buildContext(userRole: Role | undefined): ExecutionContext {
  const request = { user: userRole ? { role: userRole } : undefined };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = new Reflector();
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(reflector);
  });

  it('allows access when no roles metadata is defined', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(undefined as any);

    expect(guard.canActivate(buildContext(Role.DOCTOR))).toBe(true);
  });

  it('allows access when user role is included', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Role.DOCTOR]);

    expect(guard.canActivate(buildContext(Role.DOCTOR))).toBe(true);
  });

  it('throws ForbiddenException when user role is not allowed', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Role.DOCTOR]);

    expect(() => guard.canActivate(buildContext(Role.ATTENDANT))).toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when there is no authenticated user', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Role.ATTENDANT]);

    expect(() => guard.canActivate(buildContext(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
