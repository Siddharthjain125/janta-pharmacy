import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogQueryService } from './catalog-query.service';
import { PRODUCT_REPOSITORY } from './repositories/product-repository.interface';
import { InMemoryProductRepository } from './repositories/in-memory-product.repository';

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
 * Current implementation:
 * - In-memory repository with sample data
 * - Read-only REST endpoints
 * - No external dependencies
 */
@Module({
  controllers: [CatalogController],
  providers: [
    CatalogQueryService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: InMemoryProductRepository,
    },
  ],
  exports: [
    // Export query service for other modules
    CatalogQueryService,
    // Export repository token for testing
    PRODUCT_REPOSITORY,
  ],
})
export class CatalogModule {}
