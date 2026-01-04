import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY, IProductRepository } from './repositories';
import { Product, ProductCategory, getAllCategories } from './domain';
import {
  ProductDto,
  ProductSummaryDto,
  CategoryDto,
  toProductDto,
  toProductSummaryDto,
  toCategoryDto,
} from './dto';
import { ProductNotFoundException, InvalidProductCategoryException } from './exceptions';
import { logWithCorrelation } from '../common/logging/logger';

/**
 * Catalog Query Service
 *
 * Read-only service for catalog queries.
 * Provides application-level logic for fetching products.
 *
 * Design decisions:
 * - Depends only on ProductRepository interface
 * - Returns DTOs, not domain entities (for API safety)
 * - Handles not-found cases with domain exceptions
 * - Logs significant operations with correlation IDs
 */
@Injectable()
export class CatalogQueryService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  /**
   * Get all active products with optional filtering
   */
  async getAllActiveProducts(
    options: {
      category?: string;
      requiresPrescription?: boolean;
      page?: number;
      limit?: number;
    } = {},
    correlationId?: string,
  ): Promise<{ products: ProductSummaryDto[]; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 100); // Max 100 per page
    const offset = (page - 1) * limit;

    // Validate category if provided
    let category: ProductCategory | undefined;
    if (options.category) {
      category = this.parseCategory(options.category);
    }

    const [products, total] = await Promise.all([
      this.productRepository.findAll({
        category,
        requiresPrescription: options.requiresPrescription,
        activeOnly: true,
        limit,
        offset,
      }),
      this.productRepository.count({
        category,
        requiresPrescription: options.requiresPrescription,
        activeOnly: true,
      }),
    ]);

    if (correlationId) {
      logWithCorrelation(
        'DEBUG',
        correlationId,
        `Fetched ${products.length} products (page ${page}, total ${total})`,
        'CatalogQueryService',
      );
    }

    return {
      products: products.map(toProductSummaryDto),
      total,
      page,
      limit,
    };
  }

  /**
   * Get product by ID
   * @throws ProductNotFoundException if product not found or inactive
   */
  async getProductById(
    productId: string,
    correlationId?: string,
  ): Promise<ProductDto> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException(productId);
    }

    if (!product.isActive) {
      throw new ProductNotFoundException(productId);
    }

    if (correlationId) {
      logWithCorrelation(
        'DEBUG',
        correlationId,
        `Fetched product: ${product.name}`,
        'CatalogQueryService',
        { productId },
      );
    }

    return toProductDto(product);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryCode: string,
    options: { page?: number; limit?: number } = {},
    correlationId?: string,
  ): Promise<{ products: ProductSummaryDto[]; total: number; page: number; limit: number }> {
    const category = this.parseCategory(categoryCode);
    return this.getAllActiveProducts({ ...options, category: categoryCode }, correlationId);
  }

  /**
   * Search products by name or description
   */
  async searchProducts(
    query: string,
    options: { page?: number; limit?: number } = {},
    correlationId?: string,
  ): Promise<{ products: ProductSummaryDto[]; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const products = await this.productRepository.search(query, {
      activeOnly: true,
      limit,
      offset,
    });

    // For search, we need total matching count
    // Since our in-memory repo doesn't have a count for search,
    // we'll return the current page size as an approximation
    const total = products.length < limit ? offset + products.length : offset + limit + 1;

    if (correlationId) {
      logWithCorrelation(
        'DEBUG',
        correlationId,
        `Search for "${query}" returned ${products.length} results`,
        'CatalogQueryService',
      );
    }

    return {
      products: products.map(toProductSummaryDto),
      total,
      page,
      limit,
    };
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<CategoryDto[]> {
    return getAllCategories().map(toCategoryDto);
  }

  /**
   * Check if a product exists and is active
   */
  async productExists(productId: string): Promise<boolean> {
    return this.productRepository.exists(productId);
  }

  /**
   * Parse and validate category string
   * @throws InvalidProductCategoryException if invalid
   */
  private parseCategory(categoryCode: string): ProductCategory {
    const validCategories = getAllCategories();
    const upperCode = categoryCode.toUpperCase();

    if (!validCategories.includes(upperCode as ProductCategory)) {
      throw new InvalidProductCategoryException(categoryCode);
    }

    return upperCode as ProductCategory;
  }
}

