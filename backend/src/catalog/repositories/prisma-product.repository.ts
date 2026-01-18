import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IProductRepository } from './product-repository.interface';
import { Product, ProductCategory, Money, createProduct } from '../domain';
import { ProductSearchCriteria, ProductSearchResult, createSearchResult } from '../queries';
import {
  Product as PrismaProduct,
  ProductCategory as PrismaProductCategory,
  Prisma,
} from '@prisma/client';

/**
 * Prisma Product Repository
 *
 * Production implementation using PostgreSQL via Prisma.
 * Requires DATABASE_URL to be configured.
 *
 * Features:
 * - Efficient lookup by ID
 * - Full text search (name, description)
 * - Filtering by category, prescription requirement, active status
 * - Pagination with accurate total counts
 */
@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(productId: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    return product ? this.toDomain(product) : null;
  }

  async search(criteria: ProductSearchCriteria): Promise<ProductSearchResult<Product>> {
    const where = this.buildWhereClause(criteria);

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: criteria.offset,
        take: criteria.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return createSearchResult(
      products.map((product) => this.toDomain(product)),
      total,
      criteria,
    );
  }

  async exists(productId: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: {
        id: productId,
        isActive: true,
      },
    });
    return count > 0;
  }

  async count(criteria: ProductSearchCriteria): Promise<number> {
    const where = this.buildWhereClause(criteria);
    return this.prisma.product.count({ where });
  }

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  /**
   * Build Prisma where clause from search criteria
   */
  private buildWhereClause(criteria: ProductSearchCriteria): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    // Filter by active status
    if (criteria.activeOnly) {
      where.isActive = true;
    }

    // Filter by category
    if (criteria.category !== null) {
      where.category = this.toPrismaCategory(criteria.category);
    }

    // Filter by prescription requirement
    if (criteria.requiresPrescription !== null) {
      where.requiresPrescription = criteria.requiresPrescription;
    }

    // Text search on name and description
    if (criteria.hasSearchText) {
      const searchText = criteria.searchText!;
      where.OR = [
        { name: { contains: searchText, mode: 'insensitive' } },
        { description: { contains: searchText, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Convert Prisma product to domain Product
   */
  private toDomain(prismaProduct: PrismaProduct): Product {
    return createProduct(
      {
        id: prismaProduct.id,
        name: prismaProduct.name,
        description: prismaProduct.description,
        category: this.toDomainCategory(prismaProduct.category),
        price: Money.fromMinorUnits(prismaProduct.priceAmount, prismaProduct.priceCurrency),
        requiresPrescription: prismaProduct.requiresPrescription,
        isActive: prismaProduct.isActive,
      },
      prismaProduct.createdAt,
    );
  }

  /**
   * Convert domain ProductCategory to Prisma enum
   */
  private toPrismaCategory(category: ProductCategory): PrismaProductCategory {
    const mapping: Record<ProductCategory, PrismaProductCategory> = {
      [ProductCategory.GENERAL]: PrismaProductCategory.GENERAL,
      [ProductCategory.PRESCRIPTION]: PrismaProductCategory.PRESCRIPTION,
      [ProductCategory.AYURVEDIC]: PrismaProductCategory.AYURVEDIC,
      [ProductCategory.PERSONAL_CARE]: PrismaProductCategory.PERSONAL_CARE,
      [ProductCategory.BABY_CARE]: PrismaProductCategory.BABY_CARE,
      [ProductCategory.HEALTH_DEVICES]: PrismaProductCategory.HEALTH_DEVICES,
      [ProductCategory.SUPPLEMENTS]: PrismaProductCategory.SUPPLEMENTS,
      [ProductCategory.FIRST_AID]: PrismaProductCategory.FIRST_AID,
    };
    return mapping[category];
  }

  /**
   * Convert Prisma ProductCategory to domain enum
   */
  private toDomainCategory(category: PrismaProductCategory): ProductCategory {
    const mapping: Record<PrismaProductCategory, ProductCategory> = {
      [PrismaProductCategory.GENERAL]: ProductCategory.GENERAL,
      [PrismaProductCategory.PRESCRIPTION]: ProductCategory.PRESCRIPTION,
      [PrismaProductCategory.AYURVEDIC]: ProductCategory.AYURVEDIC,
      [PrismaProductCategory.PERSONAL_CARE]: ProductCategory.PERSONAL_CARE,
      [PrismaProductCategory.BABY_CARE]: ProductCategory.BABY_CARE,
      [PrismaProductCategory.HEALTH_DEVICES]: ProductCategory.HEALTH_DEVICES,
      [PrismaProductCategory.SUPPLEMENTS]: ProductCategory.SUPPLEMENTS,
      [PrismaProductCategory.FIRST_AID]: ProductCategory.FIRST_AID,
    };
    return mapping[category];
  }
}
