import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { LoggedUser } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): LoggedUser => {
    const user = ctx.switchToHttp().getRequest<{ user?: LoggedUser }>().user;
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  },
);
