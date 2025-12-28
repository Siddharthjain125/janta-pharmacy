import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const CORRELATION_ID_HEADER = 'X-Correlation-ID';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Get existing or generate new correlation ID
    const correlationId =
      (request.headers[CORRELATION_ID_HEADER.toLowerCase()] as string) ||
      (request.headers['x-request-id'] as string) ||
      uuidv4();

    // Attach to request headers for downstream use
    request.headers[CORRELATION_ID_HEADER.toLowerCase()] = correlationId;

    // Set on response header
    response.setHeader(CORRELATION_ID_HEADER, correlationId);

    // Log request start
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;
    console.log(
      `[${new Date().toISOString()}] [INFO] [${correlationId}] --> ${method} ${url}`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Inject correlation ID into response body if object
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            (data as Record<string, unknown>).correlationId = correlationId;
          }

          // Log request completion
          const duration = Date.now() - startTime;
          console.log(
            `[${new Date().toISOString()}] [INFO] [${correlationId}] <-- ${method} ${url} ${response.statusCode} (${duration}ms)`,
          );
        },
        error: () => {
          // Log request error (details handled by exception filter)
          const duration = Date.now() - startTime;
          console.log(
            `[${new Date().toISOString()}] [INFO] [${correlationId}] <-- ${method} ${url} ERROR (${duration}ms)`,
          );
        },
      }),
    );
  }
}

/**
 * Helper to get correlation ID from request
 */
export function getCorrelationId(request: Request): string {
  return (request.headers[CORRELATION_ID_HEADER.toLowerCase()] as string) || 'unknown';
}
