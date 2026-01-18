import { InMemoryProductRepository } from './in-memory-product.repository';
import { Product, ProductCategory, Money, createProduct } from '../domain';
import { ProductSearchCriteria } from '../queries';

/**
 * InMemoryProductRepository Tests
 *
 * Tests for the in-memory repository implementation covering:
 * - Basic CRUD operations
 * - Search functionality
 * - Filtering logic
 * - Pagination mechanics
 *
 * Design decisions:
 * - Tests repository behavior in isolation
 * - Uses custom test data for deterministic assertions
 * - Validates edge cases and boundary conditions
 */
describe('InMemoryProductRepository', () => {
  let repository: InMemoryProductRepository;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
  });

  afterEach(() => {
    repository.clear();
  });

  describe('findById', () => {
    it('should find product by ID', async () => {
      const product = await repository.findById('prod-001');

      expect(product).not.toBeNull();
      expect(product!.id.toString()).toBe('prod-001');
      expect(product!.name).toBe('Paracetamol 500mg');
    });

    it('should return null for non-existent ID', async () => {
      const product = await repository.findById('non-existent-id');

      expect(product).toBeNull();
    });

    it('should find inactive products by ID', async () => {
      // Add inactive product
      const inactiveProduct = createProduct({
        id: 'inactive-find',
        name: 'Inactive Product',
        category: ProductCategory.GENERAL,
        price: Money.fromMajorUnits(50),
        requiresPrescription: false,
        isActive: false,
      });
      (repository as any).products.set('inactive-find', inactiveProduct);

      // findById should still return it (filtering is service-level concern)
      const found = await repository.findById('inactive-find');

      expect(found).not.toBeNull();
      expect(found!.isActive).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true for existing active product', async () => {
      const exists = await repository.exists('prod-001');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent product', async () => {
      const exists = await repository.exists('non-existent');

      expect(exists).toBe(false);
    });

    it('should return false for inactive product', async () => {
      // Add inactive product
      const inactiveProduct = createProduct({
        id: 'inactive-exists',
        name: 'Inactive Exists',
        category: ProductCategory.GENERAL,
        price: Money.fromMajorUnits(50),
        requiresPrescription: false,
        isActive: false,
      });
      (repository as any).products.set('inactive-exists', inactiveProduct);

      const exists = await repository.exists('inactive-exists');

      expect(exists).toBe(false);
    });
  });

  describe('search', () => {
    describe('without filters', () => {
      it('should return all active products with default criteria', async () => {
        const criteria = ProductSearchCriteria.create({});
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(13); // All sample products
        expect(result.total).toBe(13);
      });

      it('should exclude inactive products by default', async () => {
        // Add inactive product
        const inactiveProduct = createProduct({
          id: 'inactive-search',
          name: 'Inactive Search',
          category: ProductCategory.GENERAL,
          price: Money.fromMajorUnits(50),
          requiresPrescription: false,
          isActive: false,
        });
        (repository as any).products.set('inactive-search', inactiveProduct);

        const criteria = ProductSearchCriteria.create({ activeOnly: true });
        const result = await repository.search(criteria);

        const inactiveFound = result.items.some((p) => p.id.toString() === 'inactive-search');
        expect(inactiveFound).toBe(false);
      });

      it('should include inactive products when activeOnly is false', async () => {
        // Add inactive product
        const inactiveProduct = createProduct({
          id: 'inactive-include',
          name: 'Inactive Include',
          category: ProductCategory.GENERAL,
          price: Money.fromMajorUnits(50),
          requiresPrescription: false,
          isActive: false,
        });
        (repository as any).products.set('inactive-include', inactiveProduct);

        const criteria = ProductSearchCriteria.create({ activeOnly: false });
        const result = await repository.search(criteria);

        const inactiveFound = result.items.some((p) => p.id.toString() === 'inactive-include');
        expect(inactiveFound).toBe(true);
      });
    });

    describe('text search', () => {
      it('should search by product name (case-insensitive)', async () => {
        const criteria = ProductSearchCriteria.create({
          searchText: 'paracetamol',
        });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(1);
        expect(result.items[0].name.toLowerCase()).toContain('paracetamol');
      });

      it('should search by product description', async () => {
        const criteria = ProductSearchCriteria.create({
          searchText: 'antibiotic',
        });
        const result = await repository.search(criteria);

        expect(result.items.length).toBeGreaterThanOrEqual(1);
        // Amoxicillin has "Antibiotic" in description
        const hasAntibiotic = result.items.some((p) =>
          p.description?.toLowerCase().includes('antibiotic'),
        );
        expect(hasAntibiotic).toBe(true);
      });

      it('should find partial matches', async () => {
        const criteria = ProductSearchCriteria.create({ searchText: 'sun' });
        const result = await repository.search(criteria);

        // Should find "Sunscreen"
        const hasSunscreen = result.items.some((p) => p.name.toLowerCase().includes('sun'));
        expect(hasSunscreen).toBe(true);
      });

      it('should return empty for no matches', async () => {
        const criteria = ProductSearchCriteria.create({
          searchText: 'xyznonexistent',
        });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(0);
        expect(result.total).toBe(0);
      });

      it('should handle empty search text', async () => {
        const criteria = ProductSearchCriteria.create({ searchText: '' });
        const result = await repository.search(criteria);

        // Empty search should return all active products
        expect(result.items.length).toBe(13);
      });

      it('should handle whitespace search text', async () => {
        const criteria = ProductSearchCriteria.create({ searchText: '   ' });
        const result = await repository.search(criteria);

        // Whitespace trimmed, so returns all
        expect(result.items.length).toBe(13);
      });
    });

    describe('category filter', () => {
      it('should filter by GENERAL category', async () => {
        const criteria = ProductSearchCriteria.create({
          category: ProductCategory.GENERAL,
        });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(2); // Paracetamol, Cetirizine
        result.items.forEach((product) => {
          expect(product.category).toBe(ProductCategory.GENERAL);
        });
      });

      it('should filter by PRESCRIPTION category', async () => {
        const criteria = ProductSearchCriteria.create({
          category: ProductCategory.PRESCRIPTION,
        });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(2); // Amoxicillin, Omeprazole
        result.items.forEach((product) => {
          expect(product.category).toBe(ProductCategory.PRESCRIPTION);
        });
      });

      it('should filter by HEALTH_DEVICES category', async () => {
        const criteria = ProductSearchCriteria.create({
          category: ProductCategory.HEALTH_DEVICES,
        });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(2); // Thermometer, BP Monitor
        result.items.forEach((product) => {
          expect(product.category).toBe(ProductCategory.HEALTH_DEVICES);
        });
      });
    });

    describe('prescription filter', () => {
      it('should filter to prescription-required products', async () => {
        const criteria = ProductSearchCriteria.create({
          requiresPrescription: true,
        });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(2); // Amoxicillin, Omeprazole
        result.items.forEach((product) => {
          expect(product.requiresPrescription).toBe(true);
        });
      });

      it('should filter to non-prescription products', async () => {
        const criteria = ProductSearchCriteria.create({
          requiresPrescription: false,
        });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(11); // 13 - 2 prescription
        result.items.forEach((product) => {
          expect(product.requiresPrescription).toBe(false);
        });
      });
    });

    describe('pagination', () => {
      it('should paginate first page', async () => {
        const criteria = ProductSearchCriteria.create({ page: 1, limit: 5 });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(5);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(5);
        expect(result.total).toBe(13);
        expect(result.totalPages).toBe(3);
        expect(result.hasPreviousPage).toBe(false);
        expect(result.hasNextPage).toBe(true);
      });

      it('should paginate second page', async () => {
        const criteria = ProductSearchCriteria.create({ page: 2, limit: 5 });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(5);
        expect(result.page).toBe(2);
        expect(result.hasPreviousPage).toBe(true);
        expect(result.hasNextPage).toBe(true);
      });

      it('should paginate last page with fewer items', async () => {
        const criteria = ProductSearchCriteria.create({ page: 3, limit: 5 });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(3); // 13 - 5 - 5 = 3
        expect(result.page).toBe(3);
        expect(result.hasPreviousPage).toBe(true);
        expect(result.hasNextPage).toBe(false);
      });

      it('should return empty for page beyond data', async () => {
        const criteria = ProductSearchCriteria.create({ page: 100, limit: 5 });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(0);
        expect(result.total).toBe(13);
        expect(result.page).toBe(100);
      });

      it('should handle limit of 1', async () => {
        const criteria = ProductSearchCriteria.create({ page: 1, limit: 1 });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(1);
        expect(result.totalPages).toBe(13);
      });

      it('should handle limit larger than total', async () => {
        const criteria = ProductSearchCriteria.create({ page: 1, limit: 100 });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(13);
        expect(result.totalPages).toBe(1);
        expect(result.hasNextPage).toBe(false);
        expect(result.hasPreviousPage).toBe(false);
      });
    });

    describe('combined filters', () => {
      it('should combine category and prescription filters', async () => {
        const criteria = ProductSearchCriteria.create({
          category: ProductCategory.PRESCRIPTION,
          requiresPrescription: true,
        });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(2);
        result.items.forEach((product) => {
          expect(product.category).toBe(ProductCategory.PRESCRIPTION);
          expect(product.requiresPrescription).toBe(true);
        });
      });

      it('should combine search and category filter', async () => {
        const criteria = ProductSearchCriteria.create({
          searchText: 'pack',
          category: ProductCategory.GENERAL,
        });
        const result = await repository.search(criteria);

        result.items.forEach((product) => {
          expect(product.category).toBe(ProductCategory.GENERAL);
        });
      });

      it('should combine search, category, and pagination', async () => {
        const criteria = ProductSearchCriteria.create({
          category: ProductCategory.GENERAL,
          page: 1,
          limit: 1,
        });
        const result = await repository.search(criteria);

        expect(result.items.length).toBe(1);
        expect(result.items[0].category).toBe(ProductCategory.GENERAL);
        expect(result.total).toBe(2);
        expect(result.hasNextPage).toBe(true);
      });

      it('should return correct total when filters reduce results', async () => {
        const criteria = ProductSearchCriteria.create({
          category: ProductCategory.AYURVEDIC,
          page: 1,
          limit: 10,
        });
        const result = await repository.search(criteria);

        // Total should reflect filtered count
        expect(result.total).toBe(2);
        expect(result.items.length).toBe(2);
      });
    });
  });

  describe('count', () => {
    it('should count all active products', async () => {
      const criteria = ProductSearchCriteria.create({});
      const count = await repository.count(criteria);

      expect(count).toBe(13);
    });

    it('should count with category filter', async () => {
      const criteria = ProductSearchCriteria.create({
        category: ProductCategory.SUPPLEMENTS,
      });
      const count = await repository.count(criteria);

      expect(count).toBe(2); // Vitamin D3, Omega-3
    });

    it('should count with search filter', async () => {
      const criteria = ProductSearchCriteria.create({
        searchText: 'vitamin',
      });
      const count = await repository.count(criteria);

      expect(count).toBe(1); // Vitamin D3
    });

    it('should return 0 for no matches', async () => {
      const criteria = ProductSearchCriteria.create({
        searchText: 'nonexistent',
      });
      const count = await repository.count(criteria);

      expect(count).toBe(0);
    });
  });

  describe('clear and reset', () => {
    it('should clear all products', () => {
      expect(repository.size()).toBe(13);

      repository.clear();

      expect(repository.size()).toBe(0);
    });

    it('should reset to sample data after clear', () => {
      repository.clear();
      expect(repository.size()).toBe(0);

      repository.reset();

      expect(repository.size()).toBe(13);
    });
  });

  describe('sample data integrity', () => {
    it('should have expected sample products', async () => {
      const paracetamol = await repository.findById('prod-001');
      expect(paracetamol).not.toBeNull();
      expect(paracetamol!.name).toBe('Paracetamol 500mg');
      expect(paracetamol!.category).toBe(ProductCategory.GENERAL);
      expect(paracetamol!.price.getAmount()).toBe(25);

      const amoxicillin = await repository.findById('prod-003');
      expect(amoxicillin).not.toBeNull();
      expect(amoxicillin!.name).toBe('Amoxicillin 500mg');
      expect(amoxicillin!.category).toBe(ProductCategory.PRESCRIPTION);
      expect(amoxicillin!.requiresPrescription).toBe(true);
    });

    it('should have all categories represented', async () => {
      const categories = new Set<ProductCategory>();
      const criteria = ProductSearchCriteria.create({ limit: 100 });
      const result = await repository.search(criteria);

      result.items.forEach((product) => {
        categories.add(product.category);
      });

      // Not all categories may be represented in sample data
      expect(categories.size).toBeGreaterThanOrEqual(6);
    });

    it('should have both prescription and non-prescription products', async () => {
      const prescriptionCriteria = ProductSearchCriteria.create({
        requiresPrescription: true,
      });
      const nonPrescriptionCriteria = ProductSearchCriteria.create({
        requiresPrescription: false,
      });

      const prescriptionResult = await repository.search(prescriptionCriteria);
      const nonPrescriptionResult = await repository.search(nonPrescriptionCriteria);

      expect(prescriptionResult.items.length).toBeGreaterThan(0);
      expect(nonPrescriptionResult.items.length).toBeGreaterThan(0);
    });
  });
});
