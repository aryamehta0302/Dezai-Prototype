import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HttpExceptionFilter — Global Exception Filter
 *
 * Catches ALL unhandled exceptions and normalises the response into the
 * consistent shape that every other Dezai controller returns:
 *   { success: false, statusCode, message, path, timestamp }
 *
 * Why this exists:
 *   Without this filter, NestJS returns a default error shape:
 *     { statusCode, message, error }
 *   which is inconsistent with the { success: true, data } contract used by
 *   every controller. The frontend apiClient reads `errorData.message`
 *   (core/api/client.ts line 57) which works for HttpExceptions, but raw
 *   thrown Error objects would result in unhelpful "Internal server error"
 *   messages reaching the user in production.
 *
 * Registration:
 *   Registered via app.useGlobalFilters() in main.ts — applies to all routes.
 *
 * Behaviour:
 *   - HttpException (NotFoundException, BadRequestException, etc.): preserves
 *     the correct HTTP status code and message.
 *   - Prisma errors or raw Error objects: returns HTTP 500 and logs the full
 *     stack to the server console (never exposed to the client).
 *   - ValidationPipe errors (400 Bad Request arrays): joins message array into
 *     a single comma-separated string.
 *
 * Sprint 7 — V1 Production Readiness
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';

    if (exception instanceof HttpException) {
      // NestJS built-in exceptions (NotFoundException, BadRequestException, etc.)
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        // ValidationPipe returns message as an array of strings
        if (Array.isArray(body.message)) {
          message = (body.message as string[]).join(', ');
        } else if (typeof body.message === 'string') {
          message = body.message;
        }
      }
    } else if (exception instanceof Error) {
      // Raw errors or Prisma errors — log server-side, never expose internals
      this.logger.error(
        `Unhandled error on ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      );
      // message stays 'Internal server error' — do not leak stack to client
    } else {
      this.logger.error(
        `Unknown exception type on ${request.method} ${request.url}`,
        String(exception),
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
