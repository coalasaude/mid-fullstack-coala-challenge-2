import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<{ method?: string; originalUrl?: string; url?: string }>();
    const response = http.getResponse<{ statusCode?: number; status?: number }>();

    const start = Date.now();
    const method = request.method ?? 'UNKNOWN';
    const url = request.originalUrl ?? request.url ?? '';

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - start;
          const statusCode = response.statusCode ?? response.status ?? 200;
          this.logger.log(`${method} ${url} ${statusCode} ${durationMs}ms`);
        },
        error: (error: unknown) => {
          const durationMs = Date.now() - start;
          const statusCode = this.extractStatusCode(error);
          this.logger.warn(`${method} ${url} ${statusCode} ${durationMs}ms`);
        },
      }),
    );
  }

  private extractStatusCode(error: unknown): number {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status?: unknown }).status;
      if (typeof status === 'number') {
        return status;
      }
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode?: unknown }).statusCode;
      if (typeof statusCode === 'number') {
        return statusCode;
      }
    }

    return 500;
  }
}
