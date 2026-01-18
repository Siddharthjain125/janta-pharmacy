import { HttpStatus } from '@nestjs/common';

/**
 * Standard API Error Structure
 *
 * Provides consistent error responses across the application.
 */
export class ApiError {
  readonly success = false as const;
  readonly error: ErrorDetails;
  readonly timestamp: string;
  readonly correlationId?: string;

  constructor(
    code: string,
    message: string,
    statusCode: HttpStatus,
    details?: Record<string, unknown>,
    correlationId?: string,
  ) {
    this.error = {
      code,
      message,
      statusCode,
      details,
    };
    this.timestamp = new Date().toISOString();
    this.correlationId = correlationId;
  }

  /**
   * Create a validation error
   */
  static validation(
    message: string,
    details?: Record<string, unknown>,
    correlationId?: string,
  ): ApiError {
    return new ApiError(
      'VALIDATION_ERROR',
      message,
      HttpStatus.BAD_REQUEST,
      details,
      correlationId,
    );
  }

  /**
   * Create an unauthorized error
   */
  static unauthorized(message = 'Authentication required', correlationId?: string): ApiError {
    return new ApiError('UNAUTHORIZED', message, HttpStatus.UNAUTHORIZED, undefined, correlationId);
  }

  /**
   * Create a forbidden error
   */
  static forbidden(message = 'Access denied', correlationId?: string): ApiError {
    return new ApiError('FORBIDDEN', message, HttpStatus.FORBIDDEN, undefined, correlationId);
  }

  /**
   * Create a not found error
   */
  static notFound(resource: string, correlationId?: string): ApiError {
    return new ApiError(
      'NOT_FOUND',
      `${resource} not found`,
      HttpStatus.NOT_FOUND,
      undefined,
      correlationId,
    );
  }

  /**
   * Create a conflict error
   */
  static conflict(message: string, correlationId?: string): ApiError {
    return new ApiError('CONFLICT', message, HttpStatus.CONFLICT, undefined, correlationId);
  }

  /**
   * Create an internal server error
   */
  static internal(message = 'An unexpected error occurred', correlationId?: string): ApiError {
    return new ApiError(
      'INTERNAL_ERROR',
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      undefined,
      correlationId,
    );
  }
}

/**
 * Error details structure
 */
export interface ErrorDetails {
  code: string;
  message: string;
  statusCode: HttpStatus;
  details?: Record<string, unknown>;
}

/**
 * Error codes used across the application
 */
export enum ErrorCode {
  // General errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',

  // Domain-specific error codes (placeholders)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  PRESCRIPTION_REQUIRED = 'PRESCRIPTION_REQUIRED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}
