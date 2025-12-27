/**
 * Standard API Response Wrapper
 *
 * Provides a consistent response format across all endpoints.
 */
export class ApiResponse<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly message: string;
  readonly timestamp: string;
  readonly correlationId?: string;

  private constructor(
    success: boolean,
    data: T | null,
    message: string,
    correlationId?: string,
  ) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
    this.correlationId = correlationId;
  }

  /**
   * Create a successful response
   */
  static success<T>(
    data: T,
    message = 'Operation successful',
    correlationId?: string,
  ): ApiResponse<T> {
    return new ApiResponse(true, data, message, correlationId);
  }

  /**
   * Create an error response
   */
  static error<T = null>(
    message: string,
    correlationId?: string,
  ): ApiResponse<T> {
    return new ApiResponse<T>(false, null, message, correlationId);
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    message = 'Data retrieved successfully',
    correlationId?: string,
  ): PaginatedResponse<T> {
    return {
      success: true,
      data,
      pagination,
      message,
      timestamp: new Date().toISOString(),
      correlationId,
    };
  }
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  message: string;
  timestamp: string;
  correlationId?: string;
}

