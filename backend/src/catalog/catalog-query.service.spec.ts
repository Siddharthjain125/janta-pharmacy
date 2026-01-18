import { CatalogQueryService, ProductListParams } from './catalog-query.service';
import { InMemoryProductRepository } from './repositories/in-memory-product.repository';
import { Product, ProductCategory, Money, createProduct } from './domain';
import { ProductNotFoundException, InvalidProductCategoryException } from './exceptions';

/**
 * CatalogQueryService Tests
 *
 * Tests for catalog query behavior including:
 * - Fetching products by ID
 * - Listing products with filters
 * - Search functionality
 * - Pagination
 *
 * Design decisions:
 * - Uses real InMemoryProductRepository (no mocks)
 * - Deterministic test data with known product set
 * - Focus on application behavior, not HTTP/controller concerns
 * - Independent tests with fresh repository per test
 */
describe('CatalogQueryService', () => {
  let service: CatalogQueryService;
  let repository: InMemoryProductRepository;

  const correlationId = 'test-correlation-id';

  beforeEach(() => {
    // Fresh repository with sample data for each test
    repository = new InMemoryProductRepository();
    service = new CatalogQueryService(repository);
  });

  afterEach(() => {
    repository.clear();
  });

  describe('getProductById', () => {
    it('should return product when found', async () => {
      const result = await service.getProductById('prod-001', correlationId);

      expect(result).toBeDefined();
      expect(result.id).toBe('prod-001');
      expect(result.name).toBe('Paracetamol 500mg');
      expect(result.category).toBe('GENERAL');
      expect(result.price.amount).toBe(25);
      expect(result.price.currency).toBe('INR');
    });

    it('should throw ProductNotFoundException for non-existent product', async () => {
      await expect(service.getProductById('non-existent-id', correlationId)).rejects.toThrow(
        ProductNotFoundException,
      );
    });

    it('should throw ProductNotFoundException for inactive product', async () => {
      // Add an inactive product directly to repository
      repository.clear();
      const inactiveProduct = createProduct({
        id: 'inactive-prod',
        name: 'Inactive Product',
        category: ProductCategory.GENERAL,
        price: Money.fromMajorUnits(100),
        requiresPrescription: false,
        isActive: false,
      });
      (repository as any).products.set('inactive-prod', inactiveProduct);

      await expect(service.getProductById('inactive-prod', correlationId)).rejects.toThrow(
        ProductNotFoundException,
      );
    });

    it('should work without correlation ID', async () => {
      const result = await service.getProductById('prod-001');

      expect(result).toBeDefined();
      expect(result.id).toBe('prod-001');
    });
  });

  describe('listProducts', () => {
    describe('basic listing', () => {
      it('should return all active products with default pagination', async () => {
        const result = await service.listProducts({}, correlationId);

        expect(result.items).toBeDefined();
        expect(result.items.length).toBeGreaterThan(0);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.total).toBe(13); // Sample data has 13 products
      });

      it('should return products as DTOs with expected shape', async () => {
        const result = await service.listProducts({}, correlationId);
        const firstProduct = result.items[0];

        expect(firstProduct).toHaveProperty('id');
        expect(firstProduct).toHaveProperty('name');
        expect(firstProduct).toHaveProperty('price');
        expect(firstProduct).toHaveProperty('category');
        expect(firstProduct).toHaveProperty('requiresPrescription');
        expect(firstProduct.price).toHaveProperty('amount');
        expect(firstProduct.price).toHaveProperty('currency');
      });

      it('should exclude inactive products from listing', async () => {
        // Add an inactive product
        const inactiveProduct = createProduct({
          id: 'inactive-test',
          name: 'Inactive Test Product',
          category: ProductCategory.GENERAL,
          price: Money.fromMajorUnits(50),
          requiresPrescription: false,
          isActive: false,
        });
        (repository as any).products.set('inactive-test', inactiveProduct);

        const result = await service.listProducts({}, correlationId);

        // Should not include the inactive product
        const inactiveFound = result.items.some((p) => p.id === 'inactive-test');
        expect(inactiveFound).toBe(false);
      });
    });

    describe('search by name', () => {
      it('should find products by exact name match', async () => {
        const result = await service.listProducts({ search: 'Paracetamol' }, correlationId);

        expect(result.items.length).toBe(1);
        expect(result.items[0].name).toContain('Paracetamol');
      });

      it('should perform case-insensitive search', async () => {
        const result = await service.listProducts({ search: 'paracetamol' }, correlationId);

        expect(result.items.length).toBe(1);
        expect(result.items[0].name).toContain('Paracetamol');
      });

      it('should find products by partial name match', async () => {
        const result = await service.listProducts({ search: 'Vita' }, correlationId);

        expect(result.items.length).toBeGreaterThanOrEqual(1);
        const hasVitamin = result.items.some((p) => p.name.toLowerCase().includes('vita'));
        expect(hasVitamin).toBe(true);
      });

      it('should search in product description', async () => {
        const result = await service.listProducts({ search: 'immunity' }, correlationId);

        // "immunity" appears in description of Chyawanprash and Vitamin D3
        expect(result.items.length).toBeGreaterThanOrEqual(1);
      });

      it('should return empty results for non-matching search', async () => {
        const result = await service.listProducts({ search: 'xyznonexistent' }, correlationId);

        expect(result.items.length).toBe(0);
        expect(result.total).toBe(0);
      });

      it('should handle empty search string gracefully', async () => {
        const result = await service.listProducts({ search: '' }, correlationId);

        // Empty search should return all products
        expect(result.items.length).toBeGreaterThan(0);
      });

      it('should handle whitespace-only search string', async () => {
        const result = await service.listProducts({ search: '   ' }, correlationId);

        // Whitespace-only should be treated as no search
        expect(result.items.length).toBeGreaterThan(0);
      });
    });

    describe('filter by category', () => {
      it('should filter by PRESCRIPTION category', async () => {
        const result = await service.listProducts({ category: 'PRESCRIPTION' }, correlationId);

        expect(result.items.length).toBeGreaterThan(0);
        result.items.forEach((product) => {
          expect(product.category).toBe('PRESCRIPTION');
        });
      });

      it('should filter by AYURVEDIC category', async () => {
        const result = await service.listProducts({ category: 'AYURVEDIC' }, correlationId);

        expect(result.items.length).toBe(2); // Chyawanprash and Ashwagandha
        result.items.forEach((product) => {
          expect(product.category).toBe('AYURVEDIC');
        });
      });

      it('should handle lowercase category code', async () => {
        const result = await service.listProducts({ category: 'general' }, correlationId);

        expect(result.items.length).toBeGreaterThan(0);
        result.items.forEach((product) => {
          expect(product.category).toBe('GENERAL');
        });
      });

      it('should throw InvalidProductCategoryException for invalid category', async () => {
        await expect(
          service.listProducts({ category: 'INVALID_CATEGORY' }, correlationId),
        ).rejects.toThrow(InvalidProductCategoryException);
      });

      it('should return empty results for category with no products', async () => {
        // Clear and add only one category
        repository.clear();
        const product = createProduct({
          id: 'single-prod',
          name: 'Single Product',
          category: ProductCategory.GENERAL,
          price: Money.fromMajorUnits(50),
          requiresPrescription: false,
        });
        (repository as any).products.set('single-prod', product);

        const result = await service.listProducts({ category: 'PRESCRIPTION' }, correlationId);

        expect(result.items.length).toBe(0);
        expect(result.total).toBe(0);
      });
    });

    describe('filter by requiresPrescription', () => {
      it('should filter to only prescription-required products', async () => {
        const result = await service.listProducts({ requiresPrescription: true }, correlationId);

        expect(result.items.length).toBeGreaterThan(0);
        result.items.forEach((product) => {
          expect(product.requiresPrescription).toBe(true);
        });
      });

      it('should filter to only non-prescription products', async () => {
        const result = await service.listProducts({ requiresPrescription: false }, correlationId);

        expect(result.items.length).toBeGreaterThan(0);
        result.items.forEach((product) => {
          expect(product.requiresPrescription).toBe(false);
        });
      });

      it('should count prescription vs non-prescription correctly', async () => {
        const prescriptionResult = await service.listProducts(
          { requiresPrescription: true },
          correlationId,
        );

        const nonPrescriptionResult = await service.listProducts(
          { requiresPrescription: false },
          correlationId,
        );

        const allResult = await service.listProducts({}, correlationId);

        // Sum should equal total
        expect(prescriptionResult.total + nonPrescriptionResult.total).toBe(allResult.total);
      });
    });

    describe('pagination', () => {
      it('should return first page with custom limit', async () => {
        const result = await service.listProducts({ page: 1, limit: 5 }, correlationId);

        expect(result.items.length).toBe(5);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(5);
        expect(result.hasPreviousPage).toBe(false);
        expect(result.hasNextPage).toBe(true);
      });

      it('should return second page correctly', async () => {
        const result = await service.listProducts({ page: 2, limit: 5 }, correlationId);

        expect(result.items.length).toBe(5);
        expect(result.page).toBe(2);
        expect(result.hasPreviousPage).toBe(true);
        expect(result.hasNextPage).toBe(true);
      });

      it('should return last page with fewer items', async () => {
        const result = await service.listProducts({ page: 3, limit: 5 }, correlationId);

        expect(result.items.length).toBe(3); // 13 total, 5+5+3
        expect(result.page).toBe(3);
        expect(result.hasPreviousPage).toBe(true);
        expect(result.hasNextPage).toBe(false);
      });

      it('should return empty items for page beyond total', async () => {
        const result = await service.listProducts({ page: 100, limit: 5 }, correlationId);

        expect(result.items.length).toBe(0);
        expect(result.page).toBe(100);
        expect(result.total).toBe(13);
      });

      it('should calculate totalPages correctly', async () => {
        const result = await service.listProducts({ limit: 5 }, correlationId);

        expect(result.totalPages).toBe(3); // ceil(13/5) = 3
      });

      it('should handle single-page result', async () => {
        const result = await service.listProducts({ limit: 100 }, correlationId);

        expect(result.totalPages).toBe(1);
        expect(result.hasNextPage).toBe(false);
        expect(result.hasPreviousPage).toBe(false);
      });

      it('should clamp page to minimum 1', async () => {
        const result = await service.listProducts({ page: -5, limit: 5 }, correlationId);

        expect(result.page).toBe(1);
      });

      it('should clamp limit to 1-100 range', async () => {
        const tooSmall = await service.listProducts({ limit: -1 }, correlationId);
        expect(tooSmall.limit).toBe(1);

        const tooLarge = await service.listProducts({ limit: 500 }, correlationId);
        expect(tooLarge.limit).toBe(100);
      });
    });

    describe('combined filters and pagination', () => {
      it('should apply category filter with pagination', async () => {
        const result = await service.listProducts(
          { category: 'GENERAL', page: 1, limit: 1 },
          correlationId,
        );

        expect(result.items.length).toBe(1);
        expect(result.items[0].category).toBe('GENERAL');
        expect(result.hasNextPage).toBe(true); // GENERAL has 2 products
      });

      it('should apply search with category filter', async () => {
        const result = await service.listProducts(
          { search: 'capsule', category: 'PRESCRIPTION' },
          correlationId,
        );

        result.items.forEach((product) => {
          expect(product.category).toBe('PRESCRIPTION');
        });
      });

      it('should apply prescription filter with search', async () => {
        const result = await service.listProducts(
          { search: 'tablets', requiresPrescription: true },
          correlationId,
        );

        result.items.forEach((product) => {
          expect(product.requiresPrescription).toBe(true);
        });
      });

      it('should apply all filters together', async () => {
        const result = await service.listProducts(
          {
            search: 'pack',
            category: 'PRESCRIPTION',
            requiresPrescription: true,
            page: 1,
            limit: 10,
          },
          correlationId,
        );

        result.items.forEach((product) => {
          expect(product.category).toBe('PRESCRIPTION');
          expect(product.requiresPrescription).toBe(true);
        });
        expect(result.page).toBe(1);
        expect(result.limit).toBe(10);
      });

      it('should return correct total when filters reduce results', async () => {
        // Get total for category filter
        const filtered = await service.listProducts(
          { category: 'AYURVEDIC', page: 1, limit: 1 },
          correlationId,
        );

        // Total should reflect filtered count, not overall count
        expect(filtered.total).toBe(2); // Only 2 Ayurvedic products
        expect(filtered.totalPages).toBe(2);
      });
    });
  });

  describe('getCategories', () => {
    it('should return all product categories', async () => {
      const categories = await service.getCategories();

      expect(categories).toBeDefined();
      expect(categories.length).toBe(8); // All ProductCategory values
    });

    it('should return categories with expected shape', async () => {
      const categories = await service.getCategories();
      const firstCategory = categories[0];

      expect(firstCategory).toHaveProperty('code');
      expect(firstCategory).toHaveProperty('label');
      expect(firstCategory).toHaveProperty('description');
    });

    it('should include known categories', async () => {
      const categories = await service.getCategories();
      const codes = categories.map((c) => c.code);

      expect(codes).toContain('GENERAL');
      expect(codes).toContain('PRESCRIPTION');
      expect(codes).toContain('AYURVEDIC');
      expect(codes).toContain('SUPPLEMENTS');
    });
  });

  describe('productExists', () => {
    it('should return true for existing active product', async () => {
      const exists = await service.productExists('prod-001');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent product', async () => {
      const exists = await service.productExists('non-existent');

      expect(exists).toBe(false);
    });

    it('should return false for inactive product', async () => {
      // Add an inactive product
      const inactiveProduct = createProduct({
        id: 'inactive-check',
        name: 'Inactive Check',
        category: ProductCategory.GENERAL,
        price: Money.fromMajorUnits(50),
        requiresPrescription: false,
        isActive: false,
      });
      (repository as any).products.set('inactive-check', inactiveProduct);

      const exists = await service.productExists('inactive-check');

      expect(exists).toBe(false);
    });
  });
});
