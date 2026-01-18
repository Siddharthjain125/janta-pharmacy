import { ProductCategory, PRODUCT_CATEGORY_METADATA } from '../domain';

/**
 * Product DTOs
 *
 * Data Transfer Objects for Catalog API responses.
 * These are separate from domain entities to control
 * what data crosses the API boundary.
 */

/**
 * Product data returned in API responses
 */
export interface ProductDto {
  id: string;
  name: string;
  description: string | null;
  category: string;
  categoryLabel: string;
  price: PriceDto;
  requiresPrescription: boolean;
  isActive: boolean;
}

/**
 * Price representation in API responses
 */
export interface PriceDto {
  amount: number;
  currency: string;
  formatted: string;
}

/**
 * Summary product info for listings
 */
export interface ProductSummaryDto {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  price: PriceDto;
  requiresPrescription: boolean;
}

/**
 * Category information for API responses
 */
export interface CategoryDto {
  code: string;
  label: string;
  description: string;
}

/**
 * Convert domain Product to ProductDto for API response
 */
export function toProductDto(product: {
  id: { toString(): string };
  name: string;
  description: string | null;
  category: ProductCategory;
  price: { getAmount(): number; getCurrency(): string; format(): string };
  requiresPrescription: boolean;
  isActive: boolean;
}): ProductDto {
  return {
    id: product.id.toString(),
    name: product.name,
    description: product.description,
    category: product.category,
    categoryLabel: PRODUCT_CATEGORY_METADATA[product.category].label,
    price: {
      amount: product.price.getAmount(),
      currency: product.price.getCurrency(),
      formatted: product.price.format(),
    },
    requiresPrescription: product.requiresPrescription,
    isActive: product.isActive,
  };
}

/**
 * Convert domain Product to ProductSummaryDto for listings
 */
export function toProductSummaryDto(product: {
  id: { toString(): string };
  name: string;
  category: ProductCategory;
  price: { getAmount(): number; getCurrency(): string; format(): string };
  requiresPrescription: boolean;
}): ProductSummaryDto {
  return {
    id: product.id.toString(),
    name: product.name,
    category: product.category,
    categoryLabel: PRODUCT_CATEGORY_METADATA[product.category].label,
    price: {
      amount: product.price.getAmount(),
      currency: product.price.getCurrency(),
      formatted: product.price.format(),
    },
    requiresPrescription: product.requiresPrescription,
  };
}

/**
 * Convert ProductCategory enum to CategoryDto
 */
export function toCategoryDto(category: ProductCategory): CategoryDto {
  const metadata = PRODUCT_CATEGORY_METADATA[category];
  return {
    code: category,
    label: metadata.label,
    description: metadata.description,
  };
}
