'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ROUTES } from '@/lib/constants';
import { fetchProductById } from '@/lib/catalog-service';
import type { Product } from '@/types/api';

/**
 * Product Detail Page
 *
 * Displays full details of a single product.
 * Shows prescription requirement and category info.
 */
export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchProductById(productId);
        setProduct(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load product';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  return (
    <ProtectedRoute>
      <div>
        <Link href={ROUTES.CATALOG} style={styles.backLink}>
          ← Back to Catalog
        </Link>

        {isLoading && (
          <div style={styles.loading}>
            <p>Loading product...</p>
          </div>
        )}

        {error && (
          <div style={styles.error}>
            <p>Error: {error}</p>
            <Link href={ROUTES.CATALOG} style={styles.backButton}>
              Back to Catalog
            </Link>
          </div>
        )}

        {!isLoading && !error && product && (
          <div style={styles.productContainer}>
            <div style={styles.header}>
              <h1 style={styles.title}>{product.name}</h1>
              {product.requiresPrescription && (
                <span style={styles.prescriptionBadge}>
                  Prescription Required
                </span>
              )}
            </div>

            <div style={styles.details}>
              <div style={styles.detailRow}>
                <span style={styles.label}>Category</span>
                <span style={styles.value}>{product.categoryLabel}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>Price</span>
                <span style={styles.price}>{product.price.formatted}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>Status</span>
                <span style={product.isActive ? styles.statusActive : styles.statusInactive}>
                  {product.isActive ? 'Available' : 'Unavailable'}
                </span>
              </div>

              {product.description && (
                <div style={styles.descriptionSection}>
                  <span style={styles.label}>Description</span>
                  <p style={styles.description}>{product.description}</p>
                </div>
              )}
            </div>

            {product.requiresPrescription && (
              <div style={styles.prescriptionNote}>
                <strong>Note:</strong> This product requires a valid prescription.
                Please have your prescription ready when placing an order.
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backLink: {
    display: 'inline-block',
    marginBottom: '1.5rem',
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: '0.875rem',
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
  backButton: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    background: '#333',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
  },
  productContainer: {
    maxWidth: '600px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '600',
    lineHeight: '1.3',
  },
  prescriptionBadge: {
    flexShrink: 0,
    padding: '0.25rem 0.5rem',
    background: '#fef3c7',
    color: '#92400e',
    fontSize: '0.75rem',
    fontWeight: '600',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.5rem',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  value: {
    fontSize: '0.875rem',
    color: '#111827',
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#059669',
  },
  statusActive: {
    color: '#059669',
    fontWeight: '500',
  },
  statusInactive: {
    color: '#dc2626',
    fontWeight: '500',
  },
  descriptionSection: {
    marginTop: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  description: {
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    color: '#374151',
    lineHeight: '1.6',
  },
  prescriptionNote: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#fef3c7',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#92400e',
    lineHeight: '1.5',
  },
};

