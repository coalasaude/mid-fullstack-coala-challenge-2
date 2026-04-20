import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import type { LoggedUser } from '@healthflow/shared';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HttpLoggingInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: LoggedUser }>();
    const method = req.method;
    const url = req.originalUrl ?? req.url;
    const userLabel = req.user?.id ?? 'anon';
    const startedAt = Date.now();

    this.logger.log(`-> ${method} ${url} user=${userLabel}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const res = http.getResponse<Response>();
          const elapsedMs = Date.now() - startedAt;
          this.logger.log(
            `<- ${method} ${url} ${res.statusCode} ${elapsedMs}ms user=${userLabel}`,
          );
        },
      }),
    );
  }
}
