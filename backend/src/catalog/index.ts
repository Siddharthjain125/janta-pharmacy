/**
 * Catalog Module Public API
 *
 * Export only what other modules need.
 * Internal implementation details stay hidden.
 */

// Module
export { CatalogModule } from './catalog.module';

// Query Service (for other modules to access catalog data)
export {
  CatalogQueryService,
  ProductListParams,
  ProductListResult,
} from './catalog-query.service';

// Query objects
export {
  ProductSearchCriteria,
  ProductSearchResult,
} from './queries';

// DTOs (for type safety across modules)
export {
  ProductDto,
  ProductSummaryDto,
  PriceDto,
  CategoryDto,
  toProductDto,
  toProductSummaryDto,
  toCategoryDto,
} from './dto';

// Domain exports (for type safety)
export {
  Product,
  ProductId,
  Money,
  ProductCategory,
  PRODUCT_CATEGORY_METADATA,
  getAllCategories,
  categoryRequiresPrescription,
} from './domain';

// Repository interface (for dependency injection)
export {
  PRODUCT_REPOSITORY,
  IProductRepository,
} from './repositories';

// Exceptions
export {
  ProductNotFoundException,
  ProductNotAvailableException,
  InvalidProductCategoryException,
  InvalidProductIdException,
} from './exceptions';
