import { Product, ProductCategory } from '../domain';
import { ProductSearchCriteria, ProductSearchResult } from '../queries';

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
 * - Uses ProductSearchCriteria for clean query abstraction
 * - No HTTP/transport concepts leak into this interface
 */
export interface IProductRepository {
  /**
   * Find product by ID
   * @returns Product or null if not found
   */
  findById(productId: string): Promise<Product | null>;

  /**
   * Search products using criteria
   * Returns paginated results with total count
   *
   * This is the primary query method that supports:
   * - Text search (name, description)
   * - Filtering (category, prescription, active status)
   * - Pagination
   */
  search(criteria: ProductSearchCriteria): Promise<ProductSearchResult<Product>>;

  /**
   * Check if a product exists and is active
   */
  exists(productId: string): Promise<boolean>;

  /**
   * Count products matching criteria (without pagination)
   */
  count(criteria: ProductSearchCriteria): Promise<number>;
}
