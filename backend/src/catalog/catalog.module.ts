import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

/**
 * Catalog Module
 *
 * Handles product catalog management including:
 * - Product listing and search
 * - Categories and classifications
 * - Inventory visibility
 * - Prescription requirements
 *
 * This module maintains its own data boundaries and
 * does not directly access other module's data.
 */
@Module({
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}

