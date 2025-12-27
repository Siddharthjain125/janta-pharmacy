import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ApiResponse } from '../common/api/api-response';

/**
 * Catalog Controller
 *
 * Exposes REST endpoints for product catalog management.
 * All endpoints return placeholder responses.
 */
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /**
   * Get all products with pagination and filters
   */
  @Get('products')
  async findAllProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ): Promise<ApiResponse<unknown>> {
    const products = await this.catalogService.findAllProducts(
      page,
      limit,
      category,
      search,
    );
    return ApiResponse.success(products, 'Products retrieved successfully');
  }

  /**
   * Get product by ID
   */
  @Get('products/:id')
  async findProductById(@Param('id') id: string): Promise<ApiResponse<unknown>> {
    const product = await this.catalogService.findProductById(id);
    return ApiResponse.success(product, 'Product retrieved successfully');
  }

  /**
   * Create a new product
   */
  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() createProductDto: unknown): Promise<ApiResponse<unknown>> {
    const product = await this.catalogService.createProduct(createProductDto);
    return ApiResponse.success(product, 'Product created successfully');
  }

  /**
   * Update product by ID
   */
  @Put('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: unknown,
  ): Promise<ApiResponse<unknown>> {
    const product = await this.catalogService.updateProduct(id, updateProductDto);
    return ApiResponse.success(product, 'Product updated successfully');
  }

  /**
   * Delete product by ID
   */
  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id') id: string): Promise<void> {
    await this.catalogService.deleteProduct(id);
  }

  /**
   * Get all categories
   */
  @Get('categories')
  async findAllCategories(): Promise<ApiResponse<unknown>> {
    const categories = await this.catalogService.findAllCategories();
    return ApiResponse.success(categories, 'Categories retrieved successfully');
  }

  /**
   * Get category by ID
   */
  @Get('categories/:id')
  async findCategoryById(@Param('id') id: string): Promise<ApiResponse<unknown>> {
    const category = await this.catalogService.findCategoryById(id);
    return ApiResponse.success(category, 'Category retrieved successfully');
  }

  /**
   * Search products
   */
  @Get('search')
  async searchProducts(
    @Query('q') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<ApiResponse<unknown>> {
    const results = await this.catalogService.searchProducts(query, page, limit);
    return ApiResponse.success(results, 'Search completed successfully');
  }
}

