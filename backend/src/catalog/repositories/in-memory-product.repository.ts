import { Injectable } from '@nestjs/common';
import { IProductRepository } from './product-repository.interface';
import {
  Product,
  ProductCategory,
  Money,
  createProduct,
} from '../domain';
import {
  ProductSearchCriteria,
  ProductSearchResult,
  createSearchResult,
} from '../queries';

/**
 * In-Memory Product Repository
 *
 * Development implementation that stores products in memory.
 * Pre-populated with sample pharmacy products for testing.
 *
 * Features:
 * - Efficient lookup by ID
 * - Full text search (name, description)
 * - Filtering by category, prescription requirement, active status
 * - Pagination with accurate total counts
 * - No persistence across restarts
 */
@Injectable()
export class InMemoryProductRepository implements IProductRepository {
  private readonly products: Map<string, Product> = new Map();

  constructor() {
    this.seedSampleProducts();
  }

  async findById(productId: string): Promise<Product | null> {
    return this.products.get(productId) ?? null;
  }

  async search(criteria: ProductSearchCriteria): Promise<ProductSearchResult<Product>> {
    // Get all products and apply filters
    let results = Array.from(this.products.values());

    // Apply all filters
    results = this.applyFilters(results, criteria);

    // Apply text search if provided
    if (criteria.hasSearchText) {
      results = this.applyTextSearch(results, criteria.searchText!);
    }

    // Get total before pagination
    const total = results.length;

    // Apply pagination
    results = this.applyPagination(results, criteria);

    return createSearchResult(results, total, criteria);
  }

  async exists(productId: string): Promise<boolean> {
    const product = this.products.get(productId);
    return product !== undefined && product.isActive;
  }

  async count(criteria: ProductSearchCriteria): Promise<number> {
    let results = Array.from(this.products.values());

    // Apply filters
    results = this.applyFilters(results, criteria);

    // Apply text search if provided
    if (criteria.hasSearchText) {
      results = this.applyTextSearch(results, criteria.searchText!);
    }

    return results.length;
  }

  /**
   * Apply filtering options to product list
   */
  private applyFilters(
    products: Product[],
    criteria: ProductSearchCriteria,
  ): Product[] {
    let results = products;

    // Filter by active status
    if (criteria.activeOnly) {
      results = results.filter((p) => p.isActive);
    }

    // Filter by category
    if (criteria.category !== null) {
      results = results.filter((p) => p.category === criteria.category);
    }

    // Filter by prescription requirement
    if (criteria.requiresPrescription !== null) {
      results = results.filter(
        (p) => p.requiresPrescription === criteria.requiresPrescription,
      );
    }

    return results;
  }

  /**
   * Apply text search to product list
   * Case-insensitive search on name and description
   */
  private applyTextSearch(
    products: Product[],
    searchText: string,
  ): Product[] {
    const normalizedQuery = searchText.toLowerCase().trim();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(normalizedQuery);
      const descMatch = product.description?.toLowerCase().includes(normalizedQuery) ?? false;
      return nameMatch || descMatch;
    });
  }

  /**
   * Apply pagination to product list
   */
  private applyPagination(
    products: Product[],
    criteria: ProductSearchCriteria,
  ): Product[] {
    return products.slice(criteria.offset, criteria.offset + criteria.limit);
  }

  /**
   * Seed sample pharmacy products for development
   */
  private seedSampleProducts(): void {
    const sampleProducts: Array<{
      id: string;
      name: string;
      description: string;
      category: ProductCategory;
      priceInRupees: number;
      requiresPrescription: boolean;
    }> = [
      {
        id: 'prod-001',
        name: 'Paracetamol 500mg',
        description: 'Pain relief and fever reduction tablets. Pack of 10.',
        category: ProductCategory.GENERAL,
        priceInRupees: 25,
        requiresPrescription: false,
      },
      {
        id: 'prod-002',
        name: 'Cetirizine 10mg',
        description: 'Antihistamine for allergy relief. Pack of 10.',
        category: ProductCategory.GENERAL,
        priceInRupees: 45,
        requiresPrescription: false,
      },
      {
        id: 'prod-003',
        name: 'Amoxicillin 500mg',
        description: 'Antibiotic capsules. Pack of 10. Prescription required.',
        category: ProductCategory.PRESCRIPTION,
        priceInRupees: 120,
        requiresPrescription: true,
      },
      {
        id: 'prod-004',
        name: 'Omeprazole 20mg',
        description: 'Proton pump inhibitor for acid reflux. Pack of 14.',
        category: ProductCategory.PRESCRIPTION,
        priceInRupees: 85,
        requiresPrescription: true,
      },
      {
        id: 'prod-005',
        name: 'Chyawanprash 500g',
        description: 'Traditional Ayurvedic immunity booster.',
        category: ProductCategory.AYURVEDIC,
        priceInRupees: 320,
        requiresPrescription: false,
      },
      {
        id: 'prod-006',
        name: 'Ashwagandha Capsules',
        description: 'Stress relief and vitality. Pack of 60.',
        category: ProductCategory.AYURVEDIC,
        priceInRupees: 280,
        requiresPrescription: false,
      },
      {
        id: 'prod-007',
        name: 'Digital Thermometer',
        description: 'Fast and accurate body temperature measurement.',
        category: ProductCategory.HEALTH_DEVICES,
        priceInRupees: 199,
        requiresPrescription: false,
      },
      {
        id: 'prod-008',
        name: 'Blood Pressure Monitor',
        description: 'Automatic digital BP monitor for home use.',
        category: ProductCategory.HEALTH_DEVICES,
        priceInRupees: 1850,
        requiresPrescription: false,
      },
      {
        id: 'prod-009',
        name: 'Vitamin D3 1000 IU',
        description: 'Supports bone health and immunity. 60 tablets.',
        category: ProductCategory.SUPPLEMENTS,
        priceInRupees: 450,
        requiresPrescription: false,
      },
      {
        id: 'prod-010',
        name: 'Omega-3 Fish Oil',
        description: 'Heart and brain health support. 60 softgels.',
        category: ProductCategory.SUPPLEMENTS,
        priceInRupees: 620,
        requiresPrescription: false,
      },
      {
        id: 'prod-011',
        name: 'First Aid Kit',
        description: 'Complete first aid kit with bandages, antiseptic, and more.',
        category: ProductCategory.FIRST_AID,
        priceInRupees: 399,
        requiresPrescription: false,
      },
      {
        id: 'prod-012',
        name: 'Baby Diapers (Medium)',
        description: 'Soft and absorbent diapers. Pack of 44.',
        category: ProductCategory.BABY_CARE,
        priceInRupees: 799,
        requiresPrescription: false,
      },
      {
        id: 'prod-013',
        name: 'Sunscreen SPF 50',
        description: 'Broad spectrum sun protection. 100ml.',
        category: ProductCategory.PERSONAL_CARE,
        priceInRupees: 350,
        requiresPrescription: false,
      },
    ];

    const now = new Date();
    for (const data of sampleProducts) {
      const product = createProduct(
        {
          id: data.id,
          name: data.name,
          description: data.description,
          category: data.category,
          price: Money.fromMajorUnits(data.priceInRupees),
          requiresPrescription: data.requiresPrescription,
          isActive: true,
        },
        now,
      );
      this.products.set(data.id, product);
    }
  }

  /**
   * Clear all data (useful for testing)
   */
  clear(): void {
    this.products.clear();
  }

  /**
   * Re-seed sample data (useful for testing)
   */
  reset(): void {
    this.clear();
    this.seedSampleProducts();
  }

  /**
   * Get current product count (useful for debugging)
   */
  size(): number {
    return this.products.size;
  }

  /**
   * Add a product (useful for testing)
   * Allows adding products with custom properties like isActive=false
   */
  addProduct(data: {
    id: string;
    name: string;
    description?: string;
    category: ProductCategory;
    priceInRupees: number;
    requiresPrescription: boolean;
    isActive?: boolean;
  }): void {
    const product = createProduct(
      {
        id: data.id,
        name: data.name,
        description: data.description ?? null,
        category: data.category,
        price: Money.fromMajorUnits(data.priceInRupees),
        requiresPrescription: data.requiresPrescription,
        isActive: data.isActive ?? true,
      },
      new Date(),
    );
    this.products.set(data.id, product);
  }

  /**
   * Deactivate a product by ID (useful for testing)
   */
  deactivateProduct(productId: string): void {
    const existing = this.products.get(productId);
    if (existing) {
      const deactivated = createProduct(
        {
          id: existing.id.toString(),
          name: existing.name,
          description: existing.description,
          category: existing.category,
          price: existing.price,
          requiresPrescription: existing.requiresPrescription,
          isActive: false,
        },
        existing.createdAt,
      );
      this.products.set(productId, deactivated);
    }
  }
}
