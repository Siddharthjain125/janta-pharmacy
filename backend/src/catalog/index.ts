/**
 * Catalog Module Public API
 *
 * Export only what other modules need.
 * Internal implementation details stay hidden.
 */

// Module
export { CatalogModule } from './catalog.module';

// Domain exports
export {
  Product,
  ProductId,
  Money,
  ProductCategory,
  PRODUCT_CATEGORY_METADATA,
  createProduct,
  productToDTO,
  getAllCategories,
  categoryRequiresPrescription,
} from './domain';

// Repository interface (for dependency injection)
export {
  PRODUCT_REPOSITORY,
  IProductRepository,
  FindProductsOptions,
} from './repositories';

// Exceptions
export {
  ProductNotFoundException,
  ProductNotAvailableException,
  InvalidProductCategoryException,
  InvalidProductIdException,
} from './exceptions';

