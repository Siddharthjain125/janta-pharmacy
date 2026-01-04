import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { CatalogQueryService } from './catalog-query.service';
import { ApiResponse, PaginatedResponse, PaginationMeta } from '../common/api/api-response';
import { ProductDto, ProductSummaryDto, CategoryDto } from './dto';

/**
 * Catalog Controller
 *
 * Read-only REST endpoints for browsing the product catalog.
 *
 * Design notes:
 * - All endpoints are public (no authentication required for browsing)
 * - Only GET methods (read-only catalog)
 * - Uses correlation IDs for request tracing
 * - Returns DTOs, never domain entities
 * - HTTP params are mapped to application-level query objects
 */
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogQueryService: CatalogQueryService) {}

  /**
   * List products with search, filtering, and pagination
   * GET /api/v1/catalog/products
   *
   * Query Parameters:
   * - search: Text search (searches name and description)
   * - category: Filter by category code (e.g., GENERAL, PRESCRIPTION)
   * - requiresPrescription: Filter by prescription requirement (true/false)
   * - page: Page number (1-indexed, default: 1)
   * - limit: Items per page (default: 20, max: 100)
   */
  @Get('products')
  async listProducts(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('requiresPrescription') requiresPrescription?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<PaginatedResponse<ProductSummaryDto>> {
    // Parse HTTP query params to application-level params
    const params = {
      search: search?.trim() || undefined,
      category: category?.trim() || undefined,
      requiresPrescription: this.parseBooleanParam(requiresPrescription),
      page: this.parseIntParam(page, 1),
      limit: this.parseIntParam(limit, 20),
    };

    const result = await this.catalogQueryService.listProducts(params, correlationId);

    const pagination: PaginationMeta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };

    return ApiResponse.paginated(
      result.items,
      pagination,
      'Products retrieved successfully',
      correlationId,
    );
  }

  /**
   * Get product by ID
   * GET /api/v1/catalog/products/:id
   */
  @Get('products/:id')
  async getProduct(
    @Param('id') id: string,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<ApiResponse<ProductDto>> {
    const product = await this.catalogQueryService.getProductById(id, correlationId);
    return ApiResponse.success(product, 'Product retrieved successfully', correlationId);
  }

  /**
   * Get all categories
   * GET /api/v1/catalog/categories
   */
  @Get('categories')
  async listCategories(
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<ApiResponse<CategoryDto[]>> {
    const categories = await this.catalogQueryService.getCategories();
    return ApiResponse.success(categories, 'Categories retrieved successfully', correlationId);
  }

  /**
   * Get products by category
   * GET /api/v1/catalog/categories/:code/products
   *
   * This is a convenience endpoint that filters by category.
   * Same as calling GET /products?category=:code
   */
  @Get('categories/:code/products')
  async getProductsByCategory(
    @Param('code') code: string,
    @Query('search') search?: string,
    @Query('requiresPrescription') requiresPrescription?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<PaginatedResponse<ProductSummaryDto>> {
    const params = {
      search: search?.trim() || undefined,
      category: code,
      requiresPrescription: this.parseBooleanParam(requiresPrescription),
      page: this.parseIntParam(page, 1),
      limit: this.parseIntParam(limit, 20),
    };

    const result = await this.catalogQueryService.listProducts(params, correlationId);

    const pagination: PaginationMeta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };

    return ApiResponse.paginated(
      result.items,
      pagination,
      'Products retrieved successfully',
      correlationId,
    );
  }

  /**
   * Parse string to integer with default value
   */
  private parseIntParam(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Parse string to boolean (undefined if not provided)
   */
  private parseBooleanParam(value: string | undefined): boolean | undefined {
    if (value === undefined || value === '') return undefined;
    return value.toLowerCase() === 'true';
  }
}
