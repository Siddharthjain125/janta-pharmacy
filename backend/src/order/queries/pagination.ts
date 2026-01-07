/**
 * Order Query Pagination
 *
 * Explicit pagination support for order history queries.
 * Designed to be consistent with catalog pagination patterns.
 */

/**
 * Pagination parameters for queries
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
}

/**
 * Paginated result metadata
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
 * Paginated result container
 */
export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/**
 * Normalize pagination parameters with defaults and limits
 */
export function normalizePagination(params?: Partial<PaginationParams>): PaginationParams {
  const page = Math.max(1, params?.page ?? DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, params?.limit ?? DEFAULT_LIMIT));
  return { page, limit };
}

/**
 * Calculate pagination metadata
 */
export function createPaginationMeta(
  total: number,
  params: PaginationParams,
): PaginationMeta {
  const totalPages = Math.ceil(total / params.limit) || 1;
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  };
}

/**
 * Create a paginated result from items and total count
 */
export function createPaginatedResult<T>(
  items: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  return {
    items,
    pagination: createPaginationMeta(total, params),
  };
}

