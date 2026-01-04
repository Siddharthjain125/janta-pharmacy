import { ProductId } from './product-id';
import { Money } from './money';
import { ProductCategory } from './product-category';

/**
 * Product Entity
 *
 * Represents a product in the pharmacy catalog.
 * This is a read-only view of a product for the catalog.
 *
 * Design decisions:
 * - ProductId is a value object for type safety
 * - Money is a value object to handle currency correctly
 * - requiresPrescription is explicit rather than inferred from category
 *   (some products in non-prescription categories may still require prescription)
 * - isActive allows soft-disabling products without deletion
 */
export interface Product {
  /** Unique product identifier */
  readonly id: ProductId;

  /** Product name */
  readonly name: string;

  /** Product description (optional) */
  readonly description: string | null;

  /** Product category */
  readonly category: ProductCategory;

  /** Product price */
  readonly price: Money;

  /** Whether this product requires a prescription to purchase */
  readonly requiresPrescription: boolean;

  /** Whether this product is currently active/available */
  readonly isActive: boolean;

  /** When the product was added to catalog */
  readonly createdAt: Date;

  /** When the product was last updated */
  readonly updatedAt: Date;
}

/**
 * Data required to create a new Product
 */
export interface CreateProductData {
  id: string;
  name: string;
  description?: string | null;
  category: ProductCategory;
  price: Money;
  requiresPrescription: boolean;
  isActive?: boolean;
}

/**
 * Factory function to create a new Product
 * Ensures all invariants are satisfied
 */
export function createProduct(data: CreateProductData, now: Date = new Date()): Product {
  const productId = ProductId.from(data.id);

  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Product name cannot be empty');
  }

  return {
    id: productId,
    name: data.name.trim(),
    description: data.description ?? null,
    category: data.category,
    price: data.price,
    requiresPrescription: data.requiresPrescription,
    isActive: data.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Convert Product to a plain serializable object
 */
export function productToDTO(product: Product): {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: { amount: number; currency: string };
  requiresPrescription: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: product.id.toString(),
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price.toJSON(),
    requiresPrescription: product.requiresPrescription,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

