import { ProductCategory } from '../domain';

/**
 * Product Search Criteria
 *
 * Application-level query object for searching and filtering products.
 * This is NOT an HTTP DTO - it's a clean domain concept for querying.
 *
 * Design principles:
 * - No HTTP/transport concepts (query strings, headers, etc.)
 * - Immutable after construction
 * - Self-validating with sensible defaults
 * - Can be extended without breaking existing code
 */
export class ProductSearchCriteria {
  /** Text search query (searches name and description) */
  readonly searchText: string | null;

  /** Filter by product category */
  readonly category: ProductCategory | null;

  /** Filter by prescription requirement */
  readonly requiresPrescription: boolean | null;

  /** Filter by active status (default: true) */
  readonly activeOnly: boolean;

  /** Page number (1-indexed) */
  readonly page: number;

  /** Items per page */
  readonly limit: number;

  private constructor(params: {
    searchText?: string | null;
    category?: ProductCategory | null;
    requiresPrescription?: boolean | null;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    this.searchText = params.searchText?.trim() || null;
    this.category = params.category ?? null;
    this.requiresPrescription = params.requiresPrescription ?? null;
    this.activeOnly = params.activeOnly ?? true;
    this.page = Math.max(1, params.page ?? 1);
    this.limit = Math.min(Math.max(1, params.limit ?? 20), 100); // 1-100 range
  }

  /**
   * Create a new criteria with default values
   */
  static create(params: {
    searchText?: string | null;
    category?: ProductCategory | null;
    requiresPrescription?: boolean | null;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
  } = {}): ProductSearchCriteria {
    return new ProductSearchCriteria(params);
  }

  /**
   * Calculate offset for pagination
   */
  get offset(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * Check if any filters are applied
   */
  get hasFilters(): boolean {
    return (
      this.searchText !== null ||
      this.category !== null ||
      this.requiresPrescription !== null
    );
  }

  /**
   * Check if search text is provided
   */
  get hasSearchText(): boolean {
    return this.searchText !== null && this.searchText.length > 0;
  }

  /**
   * Create a copy with different pagination
   */
  withPagination(page: number, limit: number): ProductSearchCriteria {
    return new ProductSearchCriteria({
      searchText: this.searchText,
      category: this.category,
      requiresPrescription: this.requiresPrescription,
      activeOnly: this.activeOnly,
      page,
      limit,
    });
  }

  /**
   * Create a copy with different category
   */
  withCategory(category: ProductCategory | null): ProductSearchCriteria {
    return new ProductSearchCriteria({
      searchText: this.searchText,
      category,
      requiresPrescription: this.requiresPrescription,
      activeOnly: this.activeOnly,
      page: this.page,
      limit: this.limit,
    });
  }
}

/**
 * Result of a paginated product search
 */
export interface ProductSearchResult<T> {
  /** The items matching the search criteria */
  items: T[];

  /** Total count of matching items (before pagination) */
  total: number;

  /** Current page (1-indexed) */
  page: number;

  /** Items per page */
  limit: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there is a next page */
  hasNextPage: boolean;

  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Create a ProductSearchResult from items and metadata
 */
export function createSearchResult<T>(
  items: T[],
  total: number,
  criteria: ProductSearchCriteria,
): ProductSearchResult<T> {
  const totalPages = Math.ceil(total / criteria.limit);
  return {
    items,
    total,
    page: criteria.page,
    limit: criteria.limit,
    totalPages,
    hasNextPage: criteria.page < totalPages,
    hasPreviousPage: criteria.page > 1,
  };
}

