import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';

/**
 * FacultyDataAccessInterceptor — Audit Interceptor
 *
 * Logs every faculty data-access attempt with structured context:
 *   - Faculty user ID (from JWT)
 *   - Requested resource path
 *   - Timestamp
 *   - Result (allowed / denied)
 *
 * Allowed requests are logged at INFO level.
 * Denied requests (any HttpException with 4xx status) are logged at WARN level.
 *
 * Usage: Apply via @UseInterceptors(FacultyDataAccessInterceptor) on faculty controllers.
 *
 * Sprint 7 — V1 Production Hardening
 */
@Injectable()
export class FacultyDataAccessInterceptor implements NestInterceptor {
  private readonly logger = new Logger('FacultyDataAccess');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id ?? 'ANONYMOUS';
    const method = request.method;
    const url = request.url;
    const timestamp = new Date().toISOString();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `[ACCESS_ALLOWED] facultyId=${userId} method=${method} resource=${url} timestamp=${timestamp}`,
        );
      }),
      catchError((error) => {
        const status = error?.getStatus?.() ?? 500;
        const level = status >= 400 && status < 500 ? 'warn' : 'error';

        if (level === 'warn') {
          this.logger.warn(
            `[ACCESS_DENIED] facultyId=${userId} method=${method} resource=${url} status=${status} timestamp=${timestamp} reason=${error.message}`,
          );
        } else {
          this.logger.error(
            `[ACCESS_ERROR] facultyId=${userId} method=${method} resource=${url} status=${status} timestamp=${timestamp}`,
            error.stack,
          );
        }

        throw error;
      }),
    );
  }
}
