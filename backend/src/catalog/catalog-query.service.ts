import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY, IProductRepository } from './repositories';
import { ProductCategory, getAllCategories } from './domain';
import {
  ProductDto,
  ProductSummaryDto,
  CategoryDto,
  toProductDto,
  toProductSummaryDto,
  toCategoryDto,
} from './dto';
import {
  ProductSearchCriteria,
  ProductSearchResult,
} from './queries';
import { ProductNotFoundException, InvalidProductCategoryException } from './exceptions';
import { logWithCorrelation } from '../common/logging/logger';

/**
 * Product List Query Parameters
 *
 * Application-level parameters for listing products.
 * The service converts these to ProductSearchCriteria.
 */
export interface ProductListParams {
  /** Text search query */
  search?: string;
  /** Filter by category code */
  category?: string;
  /** Filter by prescription requirement */
  requiresPrescription?: boolean;
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Product List Result
 *
 * Paginated result with metadata for API responses.
 */
export interface ProductListResult {
  items: ProductSummaryDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

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
 * - Uses ProductSearchCriteria for clean query abstraction
 */
@Injectable()
export class CatalogQueryService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  /**
   * List products with search, filtering, and pagination
   *
   * This is the primary method for browsing the catalog.
   */
  async listProducts(
    params: ProductListParams = {},
    correlationId?: string,
  ): Promise<ProductListResult> {
    // Validate and parse category if provided
    let category: ProductCategory | null = null;
    if (params.category) {
      category = this.parseCategory(params.category);
    }

    // Build search criteria
    const criteria = ProductSearchCriteria.create({
      searchText: params.search,
      category,
      requiresPrescription: params.requiresPrescription,
      activeOnly: true,
      page: params.page,
      limit: params.limit,
    });

    // Execute search
    const result = await this.productRepository.search(criteria);

    if (correlationId) {
      logWithCorrelation(
        'DEBUG',
        correlationId,
        `Listed ${result.items.length} products (page ${result.page}/${result.totalPages}, total ${result.total})`,
        'CatalogQueryService',
        {
          search: params.search ?? null,
          category: params.category ?? null,
          requiresPrescription: params.requiresPrescription ?? null,
        },
      );
    }

    return {
      items: result.items.map(toProductSummaryDto),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
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
