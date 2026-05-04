import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';
import type { LoggedUser } from '@healthflow/shared';

@Injectable()
export class HttpErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HttpErrorLoggingInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: LoggedUser }>();
    const method = req.method;
    const url = req.originalUrl ?? req.url;
    const userLabel = req.user?.id ?? 'anon';

    return next.handle().pipe(
      tap({
        error: (error: unknown) => {
          const status =
            error instanceof HttpException ? error.getStatus() : 500;
          const message =
            error instanceof Error ? error.message : String(error);
          const stack = error instanceof Error ? error.stack : undefined;

          this.logger.error(
            `xx ${method} ${url} ${status} user=${userLabel} message="${message}"`,
            stack,
          );
        },
      }),
    );
  }
}
