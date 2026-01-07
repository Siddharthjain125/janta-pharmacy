'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { fetchProducts, fetchCategories } from '@/lib/catalog-service';
import { addItemToCart, getCart } from '@/lib/cart-service';
import { calculatePricingDisplay, formatPrice } from '@/lib/pricing-display';
import type { ProductSummary, PaginationMeta, Category, Cart } from '@/types/api';

/**
 * Catalog filter state derived from URL params
 */
interface CatalogFilters {
  search: string;
  category: string;
  requiresPrescription: string; // 'true' | 'false' | '' (empty = all)
  page: number;
}

/**
 * Parse URL search params into filter state
 */
function parseFiltersFromURL(searchParams: URLSearchParams): CatalogFilters {
  return {
    search: searchParams.get('search') ?? '',
    category: searchParams.get('category') ?? '',
    requiresPrescription: searchParams.get('requiresPrescription') ?? '',
    page: parseInt(searchParams.get('page') ?? '1', 10) || 1,
  };
}

/**
 * Build URL search params from filter state
 */
function buildURLParams(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set('search', filters.search.trim());
  }
  if (filters.category) {
    params.set('category', filters.category);
  }
  if (filters.requiresPrescription) {
    params.set('requiresPrescription', filters.requiresPrescription);
  }
  if (filters.page > 1) {
    params.set('page', String(filters.page));
  }

  return params.toString();
}

/**
 * Catalog Page
 *
 * PUBLIC page - no auth required for browsing.
 * Displays a list of available products with:
 * - Text search
 * - Category filter
 * - Prescription filter
 * - Pagination
 *
 * Cart operations require authentication.
 * All filters are synced with URL for shareability.
 */
export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Parse initial state from URL
  const [filters, setFilters] = useState<CatalogFilters>(() =>
    parseFiltersFromURL(searchParams),
  );

  // Local search input (debounced before applying)
  const [searchInput, setSearchInput] = useState(filters.search);

  // Data state
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart state - tracks quantities in cart for each product
  const [cart, setCart] = useState<Cart | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<{ productId: string; message: string } | null>(null);

  // Get quantity of a product in cart
  const getCartQuantity = (productId: string): number => {
    if (!cart) return 0;
    const item = cart.items.find(item => item.productId === productId);
    return item?.quantity || 0;
  };

  // Load categories on mount
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {
        // Categories are optional, don't block on error
      });
  }, []);

  // Load cart when authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      getCart()
        .then(setCart)
        .catch(() => {
          // Cart might not exist yet, that's ok
          setCart(null);
        });
    } else {
      setCart(null);
    }
  }, [isAuthenticated, isAuthLoading]);

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: CatalogFilters) => {
      const queryString = buildURLParams(newFilters);
      const newPath = queryString ? `/catalog?${queryString}` : '/catalog';
      router.push(newPath, { scroll: false });
    },
    [router],
  );

  // Sync filters from URL on navigation
  useEffect(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    setFilters(urlFilters);
    setSearchInput(urlFilters.search);
  }, [searchParams]);

  // Fetch products when filters change
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchProducts({
          search: filters.search || undefined,
          category: filters.category || undefined,
          requiresPrescription:
            filters.requiresPrescription === 'true'
              ? true
              : filters.requiresPrescription === 'false'
                ? false
                : undefined,
          page: filters.page,
          limit: 12,
        });
        setProducts(response.data);
        setPagination(response.pagination);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load products';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [filters]);

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        const newFilters = { ...filters, search: searchInput, page: 1 };
        setFilters(newFilters);
        updateURL(newFilters);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, filters, updateURL]);

  // Filter change handlers
  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category, page: 1 };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handlePrescriptionChange = (value: string) => {
    const newFilters = { ...filters, requiresPrescription: value, page: 1 };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleClearFilters = () => {
    const newFilters: CatalogFilters = {
      search: '',
      category: '',
      requiresPrescription: '',
      page: 1,
    };
    setFilters(newFilters);
    setSearchInput('');
    updateURL(newFilters);
  };

  const hasActiveFilters =
    filters.search || filters.category || filters.requiresPrescription;

  // Add to cart handler
  const handleAddToCart = async (e: React.MouseEvent, productId: string, quantity: number = 1) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    e.stopPropagation();

    // Require login for cart operations
    if (!isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (addingToCart) return; // Prevent double-clicks

    setAddingToCart(productId);
    setCartMessage(null);

    try {
      const updatedCart = await addItemToCart(productId, quantity);
      setCart(updatedCart);
      setCartMessage({ productId, message: 'Added to cart!' });
      // Clear message after 2 seconds
      setTimeout(() => setCartMessage(null), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to cart';
      setCartMessage({ productId, message });
    } finally {
      setAddingToCart(null);
    }
  };

  // Update cart quantity handler (for +/- controls)
  const handleUpdateQuantity = async (e: React.MouseEvent, productId: string, newQuantity: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || addingToCart) return;

    setAddingToCart(productId);

    try {
      if (newQuantity <= 0) {
        // Remove from cart
        const { removeCartItem } = await import('@/lib/cart-service');
        const updatedCart = await removeCartItem(productId);
        setCart(updatedCart);
      } else {
        // Update quantity
        const { updateCartItem } = await import('@/lib/cart-service');
        const updatedCart = await updateCartItem(productId, newQuantity);
        setCart(updatedCart);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update cart';
      setCartMessage({ productId, message });
      setTimeout(() => setCartMessage(null), 2000);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div>
      <h1 style={styles.title}>Product Catalog</h1>

        {/* Filters */}
        <div style={styles.filters}>
          {/* Search Input */}
          <div style={styles.filterGroup}>
            <label htmlFor="search" style={styles.label}>
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              style={styles.input}
            />
          </div>

          {/* Category Select */}
          <div style={styles.filterGroup}>
            <label htmlFor="category" style={styles.label}>
              Category
            </label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={styles.select}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.code} value={cat.code}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prescription Filter */}
          <div style={styles.filterGroup}>
            <label htmlFor="prescription" style={styles.label}>
              Prescription
            </label>
            <select
              id="prescription"
              value={filters.requiresPrescription}
              onChange={(e) => handlePrescriptionChange(e.target.value)}
              style={styles.select}
            >
              <option value="">All Products</option>
              <option value="true">Prescription Required</option>
              <option value="false">No Prescription</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button onClick={handleClearFilters} style={styles.clearButton}>
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Summary */}
        {pagination && !isLoading && (
          <p style={styles.resultsSummary}>
            {pagination.total === 0
              ? 'No products found'
              : `Showing ${products.length} of ${pagination.total} products`}
            {hasActiveFilters && ' (filtered)'}
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={styles.loading}>
            <p>Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={styles.error}>
            <p>Error: {error}</p>
            <button onClick={() => handlePageChange(1)} style={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div style={styles.empty}>
            <p>No products found.</p>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} style={styles.retryButton}>
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !error && products.length > 0 && (
          <>
            <div style={styles.grid}>
              {products.map((product) => (
                <div key={product.id} style={styles.card}>
                  <Link href={ROUTES.PRODUCT_DETAIL(product.id)} style={styles.cardLink}>
                    <div style={styles.cardHeader}>
                      <span style={styles.productName}>{product.name}</span>
                      {product.requiresPrescription && (
                        <span style={styles.prescriptionBadge}>Rx</span>
                      )}
                    </div>
                    <div style={styles.cardBody}>
                      <span style={styles.category}>{product.categoryLabel}</span>
                      {(() => {
                        const pricing = calculatePricingDisplay(
                          product.price.amount,
                          product.price.currency,
                        );
                        return (
                          <div style={styles.priceContainer}>
                            <span style={styles.mrp}>
                              {formatPrice(pricing.mrp, pricing.currency)}
                            </span>
                            <span style={styles.price}>
                              {formatPrice(pricing.sellingPrice, pricing.currency)}
                            </span>
                            <span style={styles.discount}>
                              {pricing.discountPercent}% off
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </Link>
                  <div style={styles.cardActions}>
                    {(() => {
                      const qty = getCartQuantity(product.id);
                      const isUpdating = addingToCart === product.id;
                      
                      if (qty > 0) {
                        // Show quantity controls + View Cart
                        return (
                          <div style={styles.cartControlsRow}>
                            <div style={styles.quantityControls}>
                              <button
                                onClick={(e) => handleUpdateQuantity(e, product.id, qty - 1)}
                                disabled={isUpdating}
                                style={{
                                  ...styles.quantityButton,
                                  ...(isUpdating ? styles.quantityButtonDisabled : {}),
                                }}
                              >
                                −
                              </button>
                              <span style={styles.quantityDisplay}>
                                {isUpdating ? '...' : qty}
                              </span>
                              <button
                                onClick={(e) => handleUpdateQuantity(e, product.id, qty + 1)}
                                disabled={isUpdating}
                                style={{
                                  ...styles.quantityButton,
                                  ...(isUpdating ? styles.quantityButtonDisabled : {}),
                                }}
                              >
                                +
                              </button>
                            </div>
                            <Link
                              href={ROUTES.CART}
                              style={styles.viewCartButton}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Cart
                            </Link>
                          </div>
                        );
                      }
                      
                      // Show Add to Cart button
                      return (
                        <button
                          onClick={(e) => handleAddToCart(e, product.id)}
                          disabled={isUpdating}
                          style={{
                            ...styles.addToCartButton,
                            ...(isUpdating ? styles.addToCartButtonDisabled : {}),
                          }}
                        >
                          {isUpdating ? 'Adding...' : 'Add to Cart'}
                        </button>
                      );
                    })()}
                    {cartMessage?.productId === product.id && (
                      <span style={styles.cartMessage}>{cartMessage.message}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  style={{
                    ...styles.pageButton,
                    ...(pagination.hasPreviousPage ? {} : styles.pageButtonDisabled),
                  }}
                >
                  Previous
                </button>
                <span style={styles.pageInfo}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!pagination.hasNextPage}
                  style={{
                    ...styles.pageButton,
                    ...(pagination.hasNextPage ? {} : styles.pageButtonDisabled),
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    marginBottom: '1.5rem',
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'flex-end',
    marginBottom: '1.5rem',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    minWidth: '150px',
    flex: '1 1 150px',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  input: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    fontSize: '0.875rem',
    outline: 'none',
  },
  select: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    fontSize: '0.875rem',
    background: '#fff',
    outline: 'none',
    cursor: 'pointer',
  },
  clearButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #e5e7eb',
    background: '#fff',
    borderRadius: '4px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    color: '#6b7280',
    alignSelf: 'flex-end',
  },
  resultsSummary: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '2rem',
    color: '#dc2626',
  },
  retryButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    background: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    padding: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
    flex: 1,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  productName: {
    fontWeight: '500',
    fontSize: '1rem',
    lineHeight: '1.4',
  },
  prescriptionBadge: {
    flexShrink: 0,
    padding: '0.125rem 0.375rem',
    background: '#fef3c7',
    color: '#92400e',
    fontSize: '0.75rem',
    fontWeight: '600',
    borderRadius: '4px',
  },
  cardBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.125rem',
  },
  mrp: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    textDecoration: 'line-through',
  },
  price: {
    fontWeight: '600',
    color: '#059669',
    fontSize: '1rem',
  },
  discount: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#dc2626',
    background: '#fef2f2',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  pageButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #e5e7eb',
    background: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  cardActions: {
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  addToCartButton: {
    padding: '0.5rem 1rem',
    background: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  addToCartButtonDisabled: {
    background: '#9ca3af',
    cursor: 'not-allowed',
  },
  cartMessage: {
    fontSize: '0.75rem',
    color: '#059669',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#f3f4f6',
    borderRadius: '6px',
    padding: '0.25rem',
  },
  quantityButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    background: '#059669',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.125rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    background: '#9ca3af',
    cursor: 'not-allowed',
  },
  quantityDisplay: {
    minWidth: '28px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.9375rem',
  },
  cartControlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  viewCartButton: {
    padding: '0.5rem 0.75rem',
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    fontSize: '0.8125rem',
    fontWeight: '500',
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};
