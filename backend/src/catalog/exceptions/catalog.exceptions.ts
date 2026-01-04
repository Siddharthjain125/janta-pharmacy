import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/business.exception';

/**
 * Catalog-specific domain exceptions
 *
 * All catalog-related errors extend BusinessException
 * to ensure consistent API error responses.
 */

/**
 * Thrown when a product is not found by ID
 */
export class ProductNotFoundException extends BusinessException {
  constructor(productId: string) {
    super(
      'PRODUCT_NOT_FOUND',
      `Product not found: ${productId}`,
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Thrown when a product is inactive and cannot be accessed
 */
export class ProductNotAvailableException extends BusinessException {
  constructor(productId: string) {
    super(
      'PRODUCT_NOT_AVAILABLE',
      `Product is not available: ${productId}`,
      HttpStatus.GONE,
    );
  }
}

/**
 * Thrown when an invalid product category is provided
 */
export class InvalidProductCategoryException extends BusinessException {
  constructor(category: string) {
    super(
      'INVALID_PRODUCT_CATEGORY',
      `Invalid product category: ${category}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Thrown when an invalid product ID format is provided
 */
export class InvalidProductIdException extends BusinessException {
  constructor(productId: string) {
    super(
      'INVALID_PRODUCT_ID',
      `Invalid product ID format: ${productId}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

