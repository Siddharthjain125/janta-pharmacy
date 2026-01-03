'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';

/**
 * Header Component
 * 
 * Simple navigation header with auth-aware links.
 * TODO: Add proper styling
 * TODO: Add mobile menu
 */
export function Header() {
  const { isAuthenticated, user, logout } = useAuth();

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
          <Link href={ROUTES.ORDERS} style={styles.link}>
            Orders
          </Link>
        </nav>

        <div style={styles.auth}>
          {isAuthenticated ? (
            <>
              <span style={styles.user}>{user?.email}</span>
              <button onClick={logout} style={styles.button}>
                Logout
              </button>
            </>
          ) : (
            <Link href={ROUTES.LOGIN} style={styles.link}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Inline styles (temporary)
 * TODO: Replace with proper CSS/Tailwind
 */
const styles: Record<string, React.CSSProperties> = {
  header: {
    borderBottom: '1px solid #eaeaea',
    padding: '1rem 0',
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
    color: '#333',
  },
  nav: {
    display: 'flex',
    gap: '1.5rem',
  },
  link: {
    textDecoration: 'none',
    color: '#666',
  },
  auth: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  user: {
    color: '#666',
    fontSize: '0.875rem',
  },
  button: {
    padding: '0.5rem 1rem',
    border: '1px solid #333',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: '4px',
  },
};

