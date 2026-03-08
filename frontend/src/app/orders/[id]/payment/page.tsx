'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { fetchOrderById, createPayment, submitUpiProof } from '@/lib/order-service';
import type { OrderDetail } from '@/types/api';
import type { CreatePaymentUpiResponse } from '@/lib/order-service';

type Step = 'choose' | 'cod_done' | 'upi_instructions' | 'upi_submitted';

/**
 * Payment Selection Page (Phase 6 — manual payment v1)
 *
 * Route: /orders/[id]/payment
 * Options: Cash on Delivery (COD) or UPI (manual proof upload).
 */
export default function OrderPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('choose');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upiData, setUpiData] = useState<CreatePaymentUpiResponse | null>(null);

  // UPI proof form
  const [referenceId, setReferenceId] = useState('');
  const [proofReference, setProofReference] = useState('');
  const [proofError, setProofError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrderById(orderId);
      setOrder(data);
      // If payment is already verified, show done.
      if (data.payment?.status === 'VERIFIED') {
        setStep('cod_done');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    loadOrder();
  }, [loadOrder, isAuthLoading, isAuthenticated]);

  const handleSelectCod = async () => {
    if (!orderId || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createPayment(orderId, 'COD');
      setStep('cod_done');
      setOrder((prev) => (prev ? { ...prev, payment: { method: 'COD', status: 'VERIFIED' } } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectUpi = async () => {
    if (!orderId || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createPayment(orderId, 'UPI');
      if (result && 'upiInstructions' in result) {
        setUpiData(result);
        setStep('upi_instructions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitUpiProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !referenceId.trim()) {
      setProofError('Please enter the UPI reference number.');
      return;
    }
    setIsSubmitting(true);
    setProofError(null);
    try {
      await submitUpiProof(orderId, {
        referenceId: referenceId.trim(),
        proofReference: proofReference.trim() || undefined,
      });
      setStep('upi_submitted');
      setOrder((prev) => (prev ? { ...prev, payment: { method: 'UPI', status: 'SUBMITTED' } } : null));
    } catch (err) {
      setProofError(err instanceof Error ? err.message : 'Failed to submit proof. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

  if (!orderId) {
    return (
      <ProtectedRoute>
        <div style={styles.container}>
          <p>Invalid order.</p>
          <Link href={ROUTES.ORDERS}>Back to Orders</Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        <h1 style={styles.title}>Payment</h1>

        {isLoading && (
          <div style={styles.loading}>
            <p>Loading order...</p>
          </div>
        )}

        {error && !isLoading && (
          <div style={styles.error}>
            <p>{error}</p>
            <Link href={ROUTES.ORDER_DETAIL(orderId)} style={styles.link}>
              View order details
            </Link>
          </div>
        )}

        {!isLoading && !error && order && (
          <>
            <div style={styles.summary}>
              <p style={styles.summaryText}>
                Order total: {formatPrice(order.total.amount, order.total.currency)}
              </p>
            </div>

            {step === 'choose' && (
              <div style={styles.card}>
                <p style={styles.message}>
                  Choose how you would like to pay. Order will be fulfilled after medical approval (if required) and payment verification.
                </p>
                <div style={styles.options}>
                  <button
                    type="button"
                    onClick={handleSelectCod}
                    disabled={isSubmitting}
                    style={{ ...styles.primaryButton, marginBottom: '0.75rem' }}
                  >
                    {isSubmitting ? 'Processing...' : 'Cash on Delivery (COD)'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectUpi}
                    disabled={isSubmitting}
                    style={styles.secondaryButton}
                  >
                    Pay by UPI
                  </button>
                </div>
              </div>
            )}

            {step === 'cod_done' && (
              <div style={styles.card}>
                <div style={styles.icon}>✓</div>
                <h2 style={styles.doneTitle}>Cash on delivery selected</h2>
                <p style={styles.doneText}>
                  Your order will be fulfilled after medical approval (if required). Payment will be collected at delivery.
                </p>
                <Link href={ROUTES.ORDER_DETAIL(orderId)} style={styles.primaryButton as React.CSSProperties}>
                  View order details
                </Link>
              </div>
            )}

            {step === 'upi_instructions' && upiData && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Pay by UPI</h2>
                <p style={styles.vpaLabel}>Send payment to this VPA:</p>
                <p style={styles.vpa}>{upiData.upiInstructions.vpa}</p>
                <p style={styles.amount}>
                  Amount: {formatPrice(order.total.amount, order.total.currency)}
                </p>
                <ol style={styles.steps}>
                  {upiData.upiInstructions.steps.map((s, i) => (
                    <li key={i} style={styles.stepItem}>{s}</li>
                  ))}
                </ol>
                <form onSubmit={handleSubmitUpiProof} style={styles.form}>
                  <label style={styles.label}>
                    UPI transaction reference number *
                    <input
                      type="text"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      placeholder="e.g. 123456789012"
                      style={styles.input}
                      required
                    />
                  </label>
                  <label style={styles.label}>
                    Payment screenshot / proof (file reference, optional)
                    <input
                      type="text"
                      value={proofReference}
                      onChange={(e) => setProofReference(e.target.value)}
                      placeholder="Optional: paste image URL or reference"
                      style={styles.input}
                    />
                  </label>
                  {proofError && <p style={styles.proofError}>{proofError}</p>}
                  <button type="submit" disabled={isSubmitting} style={styles.primaryButton}>
                    {isSubmitting ? 'Submitting...' : 'Submit proof'}
                  </button>
                </form>
              </div>
            )}

            {step === 'upi_submitted' && (
              <div style={styles.card}>
                <div style={styles.icon}>✓</div>
                <h2 style={styles.doneTitle}>Payment received and pending verification</h2>
                <p style={styles.doneText}>
                  Your UPI proof has been submitted. The order will be fulfilled after medical approval (if required) and payment verification.
                </p>
                <Link href={ROUTES.ORDER_DETAIL(orderId)} style={styles.primaryButton as React.CSSProperties}>
                  View order details
                </Link>
              </div>
            )}

            <p style={styles.footer}>
              <Link href={ROUTES.ORDER_DETAIL(orderId)} style={styles.link}>
                ← Back to order
              </Link>
            </p>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '1.5rem',
  },
  title: {
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  error: {
    padding: '1rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
  },
  summary: {
    marginBottom: '1.5rem',
  },
  summaryText: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#374151',
  },
  card: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  message: {
    fontSize: '0.9375rem',
    color: '#4b5563',
    marginBottom: '1.25rem',
    lineHeight: 1.5,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
  },
  primaryButton: {
    display: 'inline-block',
    padding: '0.875rem 1.5rem',
    background: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center' as const,
    textDecoration: 'none',
  },
  secondaryButton: {
    padding: '0.875rem 1.5rem',
    background: 'white',
    color: '#2563eb',
    border: '1px solid #2563eb',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  icon: {
    width: '48px',
    height: '48px',
    background: '#059669',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  doneTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  doneText: {
    fontSize: '0.9375rem',
    color: '#6b7280',
    marginBottom: '1.25rem',
    lineHeight: 1.5,
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  vpaLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.25rem',
  },
  vpa: {
    fontSize: '1.25rem',
    fontWeight: 600,
    fontFamily: 'monospace',
    marginBottom: '1rem',
  },
  amount: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  steps: {
    marginBottom: '1.5rem',
    paddingLeft: '1.25rem',
    fontSize: '0.9375rem',
    color: '#4b5563',
    lineHeight: 1.6,
  },
  stepItem: {
    marginBottom: '0.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  input: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem',
  },
  proofError: {
    color: '#dc2626',
    fontSize: '0.875rem',
    margin: 0,
  },
  footer: {
    marginTop: '1rem',
    fontSize: '0.875rem',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
};
