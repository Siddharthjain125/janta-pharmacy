/**
 * Catalog Domain Exports
 *
 * Only export what other modules need.
 * Internal implementation details stay hidden.
 */

// Value Objects
export { ProductId } from './product-id';
export { Money } from './money';

// Category enum and helpers
export {
  ProductCategory,
  PRODUCT_CATEGORY_METADATA,
  getAllCategories,
  categoryRequiresPrescription,
} from './product-category';

// Entity and factory
export {
  Product,
  CreateProductData,
  createProduct,
  productToDTO,
} from './product.entity';

