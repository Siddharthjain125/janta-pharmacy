import { Product, ProductCategory } from '../domain';

/**
 * Injection token for the Product repository
 */
export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

/**
 * Product Repository Interface (Read-Only)
 *
 * Defines the contract for product data access.
 * This interface is READ-ONLY for the catalog module.
 * Write operations would be in a separate admin/inventory module.
 *
 * Design notes:
 * - All methods are async for consistency
 * - Returns Product entities, not database models
 * - Filtering options for efficient queries
 * - No write operations in this interface
 */
export interface IProductRepository {
  /**
   * Find product by ID
   * @returns Product or null if not found
   */
  findById(productId: string): Promise<Product | null>;

  /**
   * Find all active products with optional filters
   * @param options Filtering and pagination options
   */
  findAll(options?: FindProductsOptions): Promise<Product[]>;

  /**
   * Find products by category
   * @param category The product category to filter by
   * @param options Additional filtering options
   */
  findByCategory(
    category: ProductCategory,
    options?: Omit<FindProductsOptions, 'category'>,
  ): Promise<Product[]>;

  /**
   * Search products by name or description
   * @param query Search query string
   * @param options Additional filtering options
   */
  search(query: string, options?: FindProductsOptions): Promise<Product[]>;

  /**
   * Check if a product exists and is active
   */
  exists(productId: string): Promise<boolean>;

  /**
   * Count products with optional filters
   */
  count(options?: Omit<FindProductsOptions, 'limit' | 'offset'>): Promise<number>;
}

/**
 * Options for filtering and paginating product queries
 */
export interface FindProductsOptions {
  /** Filter by category */
  category?: ProductCategory;

  /** Filter by prescription requirement */
  requiresPrescription?: boolean;

  /** Only include active products (default: true) */
  activeOnly?: boolean;

  /** Maximum number of results */
  limit?: number;

  /** Number of results to skip */
  offset?: number;
}

