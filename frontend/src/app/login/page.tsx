'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';

/**
 * Login Page
 *
 * Phone number + password authentication form.
 * Redirects to home on successful login.
 */
export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, isLoading, isAuthenticated, error, clearError } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push(ROUTES.HOME);
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Basic validation
    if (!phoneNumber.trim()) {
      setLocalError('Phone number is required');
      return;
    }
    if (!password) {
      setLocalError('Password is required');
      return;
    }

    try {
      await login(phoneNumber.trim(), password);
      router.push(ROUTES.HOME);
    } catch {
      // Error is handled by auth context
    }
  };

  const displayError = localError || error;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {displayError && (
          <div style={styles.error} role="alert">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="phoneNumber" style={styles.label}>
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+92 300 1234567"
              style={styles.input}
              autoComplete="tel"
              disabled={isLoading}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href={ROUTES.REGISTER} style={styles.link}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: 'calc(100vh - 200px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '2rem',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  subtitle: {
    margin: '0.5rem 0 1.5rem',
    color: '#666',
    fontSize: '0.95rem',
  },
  error: {
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '0.875rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: '500',
    fontSize: '0.875rem',
    color: '#374151',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    outline: 'none',
  },
  button: {
    padding: '0.875rem 1rem',
    background: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    marginTop: '0.5rem',
    transition: 'background-color 0.15s',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.875rem',
  },
  link: {
    color: '#059669',
    fontWeight: '500',
    textDecoration: 'none',
  },
};
