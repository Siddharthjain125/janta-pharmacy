import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '../logging/logger';
import { ApiError } from '../api/api-error';

/**
 * Global HTTP Exception Filter
 *
 * Catches all exceptions and formats them consistently.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request.headers['x-correlation-id'] as string;

    let status: HttpStatus;
    let errorResponse: ApiError;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle validation errors from class-validator
      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        const messages = (exceptionResponse as { message: string | string[] }).message;
        errorResponse = ApiError.validation(
          Array.isArray(messages) ? messages.join(', ') : messages,
          { errors: messages },
          correlationId,
        );
      } else {
        errorResponse = new ApiError(
          'HTTP_ERROR',
          exception.message,
          status,
          undefined,
          correlationId,
        );
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = ApiError.internal(
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : exception.message,
        correlationId,
      );

      // Log the full error in non-production
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
        'HttpExceptionFilter',
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = ApiError.internal('An unexpected error occurred', correlationId);
    }

    // Log the error
    this.logger.warn(
      `[${request.method}] ${request.url} - ${status} - ${errorResponse.error.message}`,
      'HttpExceptionFilter',
    );

    response.status(status).json(errorResponse);
  }
}

