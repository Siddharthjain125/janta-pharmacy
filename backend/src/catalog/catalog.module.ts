import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogQueryService } from './catalog-query.service';
import { PRODUCT_REPOSITORY } from './repositories/product-repository.interface';
import { ProductRepositoryProvider } from '../database/repository.providers';

/**
 * Catalog Module
 *
 * Handles product catalog for the pharmacy.
 * Currently provides READ-ONLY access to products.
 *
 * Responsibilities:
 * - Product lookup by ID
 * - Product listing with filters
 * - Product search
 * - Category information
 *
 * Boundaries:
 * - Does NOT handle inventory (stock levels, availability)
 * - Does NOT handle pricing changes (admin operation)
 * - Does NOT handle product creation/updates (admin operation)
 * - Other modules depend on this for product information
 *
 * Repository Selection:
 * - Uses REPOSITORY_TYPE env var or auto-detects from DATABASE_URL
 * - 'memory': InMemoryProductRepository (tests, dev without DB)
 * - 'prisma': PrismaProductRepository (production, dev with DB)
 */
@Module({
  controllers: [CatalogController],
  providers: [
    CatalogQueryService,
    ProductRepositoryProvider,
  ],
  exports: [
    // Export query service for other modules
    CatalogQueryService,
    // Export repository token for testing
    PRODUCT_REPOSITORY,
  ],
})
export class CatalogModule {}
