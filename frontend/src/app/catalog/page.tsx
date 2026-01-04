'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ROUTES } from '@/lib/constants';
import { fetchAllProducts } from '@/lib/catalog-service';
import type { ProductSummary, PaginationMeta } from '@/types/api';

/**
 * Catalog Page
 *
 * Displays a list of available products.
 * Supports pagination and shows prescription indicators.
 */
export default function CatalogPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchAllProducts({ page: currentPage, limit: 12 });
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
  }, [currentPage]);

  return (
    <ProtectedRoute>
      <div>
        <h1 style={styles.title}>Product Catalog</h1>

        {isLoading && (
          <div style={styles.loading}>
            <p>Loading products...</p>
          </div>
        )}

        {error && (
          <div style={styles.error}>
            <p>Error: {error}</p>
            <button onClick={() => setCurrentPage(1)} style={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <p style={styles.empty}>No products available.</p>
        )}

        {!isLoading && !error && products.length > 0 && (
          <>
            <div style={styles.grid}>
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={ROUTES.PRODUCT_DETAIL(product.id)}
                  style={styles.card}
                >
                  <div style={styles.cardHeader}>
                    <span style={styles.productName}>{product.name}</span>
                    {product.requiresPrescription && (
                      <span style={styles.prescriptionBadge}>Rx</span>
                    )}
                  </div>
                  <div style={styles.cardBody}>
                    <span style={styles.category}>{product.categoryLabel}</span>
                    <span style={styles.price}>{product.price.formatted}</span>
                  </div>
                </Link>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage((p) => p + 1)}
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
    </ProtectedRoute>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    marginBottom: '1.5rem',
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
    display: 'block',
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
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
  price: {
    fontWeight: '600',
    color: '#059669',
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
};

