import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const start = Date.now();
    const { method, originalUrl } = req;
    const userId = (req as any).user?.id ?? 'anonymous';

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.log(
            `${method} ${originalUrl} ${res.statusCode} - ${ms}ms - user=${userId}`,
          );
        },
        error: (err) => {
          const ms = Date.now() - start;
          const status = err?.status ?? 500;
          this.logger.error(
            `${method} ${originalUrl} ${status} - ${ms}ms - user=${userId} - ${err?.message}`,
          );
        },
      }),
    );
  }
}
