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
 * - All endpoints are public (no authentication required)
 * - Only GET methods (read-only catalog)
 * - Uses correlation IDs for request tracing
 * - Returns DTOs, never domain entities
 */
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogQueryService: CatalogQueryService) {}

  /**
   * Get all products
   * GET /api/v1/catalog/products
   *
   * Supports pagination and filtering by category.
   */
  @Get('products')
  async listProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('requiresPrescription') requiresPrescription?: string,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<PaginatedResponse<ProductSummaryDto>> {
    const pageNum = parseInt(page ?? '1', 10) || 1;
    const limitNum = parseInt(limit ?? '20', 10) || 20;
    const prescriptionFilter = requiresPrescription !== undefined
      ? requiresPrescription === 'true'
      : undefined;

    const result = await this.catalogQueryService.getAllActiveProducts(
      {
        page: pageNum,
        limit: limitNum,
        category,
        requiresPrescription: prescriptionFilter,
      },
      correlationId,
    );

    const pagination: PaginationMeta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
      hasNextPage: result.page * result.limit < result.total,
      hasPreviousPage: result.page > 1,
    };

    return ApiResponse.paginated(
      result.products,
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
   * Search products
   * GET /api/v1/catalog/search?q=...
   */
  @Get('search')
  async searchProducts(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<PaginatedResponse<ProductSummaryDto>> {
    const pageNum = parseInt(page ?? '1', 10) || 1;
    const limitNum = parseInt(limit ?? '20', 10) || 20;

    const result = await this.catalogQueryService.searchProducts(
      query || '',
      { page: pageNum, limit: limitNum },
      correlationId,
    );

    const pagination: PaginationMeta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
      hasNextPage: result.page * result.limit < result.total,
      hasPreviousPage: result.page > 1,
    };

    return ApiResponse.paginated(
      result.products,
      pagination,
      'Search completed successfully',
      correlationId,
    );
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
   */
  @Get('categories/:code/products')
  async getProductsByCategory(
    @Param('code') code: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<PaginatedResponse<ProductSummaryDto>> {
    const pageNum = parseInt(page ?? '1', 10) || 1;
    const limitNum = parseInt(limit ?? '20', 10) || 20;

    const result = await this.catalogQueryService.getProductsByCategory(
      code,
      { page: pageNum, limit: limitNum },
      correlationId,
    );

    const pagination: PaginationMeta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
      hasNextPage: result.page * result.limit < result.total,
      hasPreviousPage: result.page > 1,
    };

    return ApiResponse.paginated(
      result.products,
      pagination,
      'Products retrieved successfully',
      correlationId,
    );
  }
}

