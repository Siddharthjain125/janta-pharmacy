import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from './repositories/product-repository.interface';
import { InMemoryProductRepository } from './repositories/in-memory-product.repository';

/**
 * Catalog Module
 *
 * Handles product catalog for the pharmacy.
 * This is a READ-ONLY module for Phase 2.
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
 * - No controllers (domain layer only for Phase 2)
 * - No external dependencies
 */
@Module({
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: InMemoryProductRepository,
    },
  ],
  exports: [
    // Export repository token for other modules
    PRODUCT_REPOSITORY,
  ],
})
export class CatalogModule {}
