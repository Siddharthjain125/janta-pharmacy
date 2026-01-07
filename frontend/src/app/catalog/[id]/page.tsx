'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/lib/auth-context';
import { fetchProductById } from '@/lib/catalog-service';
import {
  addItemToCart,
  updateCartItem,
  removeCartItem,
  getCart,
  onCartUpdated,
} from '@/lib/cart-service';
import { calculatePricingDisplay, formatPrice } from '@/lib/pricing-display';
import { LoginPrompt } from '@/components/LoginPrompt';
import type { Product, Cart } from '@/types/api';

/**
 * Product Detail Page
 *
 * Displays full details of a single product.
 * Shows prescription requirement, category info, and pricing.
 * Public page - no auth required for viewing.
 */
export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart state
  const [cart, setCart] = useState<Cart | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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

  // Load cart for authenticated users
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      getCart().then(setCart);
    } else if (!isAuthenticated) {
      setCart(null);
    }

    const unsubscribe = onCartUpdated(setCart);
    return () => unsubscribe();
  }, [isAuthenticated, isAuthLoading]);

  const getCartQuantity = useCallback(() => {
    if (!cart || !productId) return 0;
    const item = cart.items.find((i) => i.productId === productId);
    return item?.quantity ?? 0;
  }, [cart, productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    setIsUpdating(true);
    try {
      await addItemToCart(product.id, 1);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateQuantity = async (newQty: number) => {
    if (!product) return;

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    setIsUpdating(true);
    try {
      if (newQty <= 0) {
        await removeCartItem(product.id);
      } else {
        await updateCartItem(product.id, newQty);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const qty = getCartQuantity();

  return (
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

            {/* Pricing with MRP, Selling Price, Discount */}
            {(() => {
              const pricing = calculatePricingDisplay(
                product.price.amount,
                product.price.currency,
              );
              return (
                <div style={styles.detailRow}>
                  <span style={styles.label}>Price</span>
                  <div style={styles.priceContainer}>
                    <span style={styles.mrp}>
                      {formatPrice(pricing.mrp, pricing.currency)}
                    </span>
                    <span style={styles.sellingPrice}>
                      {formatPrice(pricing.sellingPrice, pricing.currency)}
                    </span>
                    <span style={styles.discountBadge}>
                      {pricing.discountPercent}% off
                    </span>
                  </div>
                </div>
              );
            })()}

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

          {/* Add to Cart Section */}
          <div style={styles.cartSection}>
            {qty > 0 ? (
              // Show quantity controls + View Cart
              <div style={styles.cartControlsRow}>
                <div style={styles.quantityControls}>
                  <button
                    onClick={() => handleUpdateQuantity(qty - 1)}
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
                    onClick={() => handleUpdateQuantity(qty + 1)}
                    disabled={isUpdating}
                    style={{
                      ...styles.quantityButton,
                      ...(isUpdating ? styles.quantityButtonDisabled : {}),
                    }}
                  >
                    +
                  </button>
                </div>
                <Link href={ROUTES.CART} style={styles.viewCartButton}>
                  View Cart →
                </Link>
              </div>
            ) : (
              // Show Add to Cart button
              <button
                onClick={handleAddToCart}
                disabled={isUpdating || !product.isActive || isAuthLoading}
                style={{
                  ...styles.addToCartButton,
                  ...((isUpdating || !product.isActive || isAuthLoading) ? styles.addToCartButtonDisabled : {}),
                }}
              >
                {isUpdating ? 'Adding...' : 'Add to Cart'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
      )}
    </div>
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
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  mrp: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    textDecoration: 'line-through',
  },
  sellingPrice: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#059669',
  },
  discountBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#dc2626',
    background: '#fef2f2',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
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
  cartSection: {
    marginTop: '1.5rem',
  },
  cartControlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
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
    width: '36px',
    height: '36px',
    border: 'none',
    background: '#059669',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.25rem',
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
    minWidth: '36px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '1rem',
  },
  addToCartButton: {
    padding: '0.75rem 1.5rem',
    background: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  addToCartButtonDisabled: {
    background: '#9ca3af',
    cursor: 'not-allowed',
  },
  viewCartButton: {
    padding: '0.75rem 1rem',
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    textDecoration: 'none',
  },
};
