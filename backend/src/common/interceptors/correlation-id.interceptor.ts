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

/**
 * Correlation ID Interceptor
 *
 * Ensures every request has a correlation ID for tracing.
 * If a correlation ID is provided in the request header, it is used.
 * Otherwise, a new UUID is generated.
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  private readonly headerName = 'X-Correlation-ID';

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Get or generate correlation ID
    const correlationId =
      (request.headers[this.headerName.toLowerCase()] as string) || uuidv4();

    // Set correlation ID on request for use in handlers
    request.headers[this.headerName.toLowerCase()] = correlationId;

    // Set correlation ID on response header
    response.setHeader(this.headerName, correlationId);

    return next.handle().pipe(
      tap((data) => {
        // Inject correlation ID into response if it's an object
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          (data as Record<string, unknown>).correlationId = correlationId;
        }
      }),
    );
  }
}

/**
 * Helper to get correlation ID from request
 */
export function getCorrelationId(request: Request): string {
  return (request.headers['x-correlation-id'] as string) || 'unknown';
}

