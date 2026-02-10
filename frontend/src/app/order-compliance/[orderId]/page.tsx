'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ROUTES } from '@/lib/constants';

/**
 * Order Compliance Choice Page (ADR-0055)
 *
 * Shown after checkout when the order contains prescription-required items.
 * Explains that medical approval is required before fulfilment and offers
 * two paths: upload prescription or request doctor consultation.
 *
 * No payment blocking. No fulfilment logic. No medical decisions.
 */
export default function OrderCompliancePage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const uploadUrl = orderId ? `${ROUTES.PRESCRIPTION_NEW}?orderId=${encodeURIComponent(orderId)}` : ROUTES.PRESCRIPTION_NEW;
  const consultUrl = orderId ? `${ROUTES.PRESCRIPTIONS}?mode=consult&orderId=${encodeURIComponent(orderId)}` : ROUTES.PRESCRIPTIONS;

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>✓</div>
          <h1 style={styles.title}>Your order was placed successfully</h1>
          <p style={styles.message}>
            Some items in your order require medical approval before fulfilment.
          </p>
          <p style={styles.subtext}>
            Your order has been placed successfully. Please complete one of the options below to proceed.
          </p>

          <div style={styles.actions}>
            <Link href={uploadUrl} style={styles.primaryButton}>
              Upload Prescription
            </Link>
            <Link href={consultUrl} style={styles.secondaryButton}>
              Consult a Doctor (Free Callback)
            </Link>
          </div>

          <p style={styles.hint}>
            You can upload a prescription or request a free doctor consultation. A doctor will contact you on your preferred number.
          </p>
        </div>

        {orderId && (
          <div style={styles.footer}>
            <Link href={ROUTES.ORDER_DETAIL(orderId)} style={styles.link}>
              View order details →
            </Link>
          </div>
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
  card: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '2rem',
    marginBottom: '1.5rem',
  },
  icon: {
    width: '48px',
    height: '48px',
    marginBottom: '1rem',
    background: '#059669',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  title: {
    fontSize: '1.375rem',
    fontWeight: '600',
    color: '#111',
    marginBottom: '0.75rem',
  },
  message: {
    fontSize: '1rem',
    color: '#374151',
    marginBottom: '0.5rem',
    lineHeight: 1.5,
  },
  subtext: {
    fontSize: '0.9375rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  primaryButton: {
    display: 'block',
    padding: '0.875rem 1.5rem',
    background: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.9375rem',
  },
  secondaryButton: {
    display: 'block',
    padding: '0.875rem 1.5rem',
    background: 'white',
    color: '#2563eb',
    border: '1px solid #2563eb',
    borderRadius: '6px',
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: '0.9375rem',
  },
  hint: {
    marginTop: '1.25rem',
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: 1.5,
  },
  footer: {
    textAlign: 'center',
  },
  link: {
    fontSize: '0.875rem',
    color: '#2563eb',
    textDecoration: 'none',
  },
};
