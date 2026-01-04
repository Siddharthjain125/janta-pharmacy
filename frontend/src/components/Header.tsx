'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';

/**
 * Header Component
 *
 * Navigation header with auth-aware links.
 * Shows phone number for authenticated users (primary identifier).
 */
export function Header() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  /**
   * Format phone number for display
   * Shows last 4 digits with mask for privacy
   */
  const formatPhoneDisplay = (phone: string | undefined | null): string => {
    if (!phone) return '...';
    if (phone.length <= 4) return phone;
    return `***${phone.slice(-4)}`;
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link href={ROUTES.HOME} style={styles.logo}>
          Janta Pharmacy
        </Link>

        <nav style={styles.nav}>
          <Link href={ROUTES.HOME} style={styles.link}>
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link href={ROUTES.CATALOG} style={styles.link}>
                Catalog
              </Link>
              <Link href={ROUTES.ORDERS} style={styles.link}>
                Orders
              </Link>
            </>
          )}
        </nav>

        <div style={styles.auth}>
          {isLoading ? (
            <span style={styles.loading}>Loading...</span>
          ) : isAuthenticated && user ? (
            <>
              <span style={styles.user} title={user.phoneNumber}>
                {formatPhoneDisplay(user.phoneNumber)}
              </span>
              <button onClick={logout} style={styles.button}>
                Logout
              </button>
            </>
          ) : (
            <div style={styles.authLinks}>
              <Link href={ROUTES.LOGIN} style={styles.link}>
                Login
              </Link>
              <Link href={ROUTES.REGISTER} style={styles.registerLink}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem 0',
    background: '#fff',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '1.25rem',
    textDecoration: 'none',
    color: '#059669',
  },
  nav: {
    display: 'flex',
    gap: '1.5rem',
  },
  link: {
    textDecoration: 'none',
    color: '#4b5563',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'color 0.15s',
  },
  auth: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  loading: {
    color: '#9ca3af',
    fontSize: '0.875rem',
  },
  user: {
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  button: {
    padding: '0.5rem 1rem',
    border: '1px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#4b5563',
    transition: 'background-color 0.15s, border-color 0.15s',
  },
  registerLink: {
    padding: '0.5rem 1rem',
    background: '#059669',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'background-color 0.15s',
  },
};
