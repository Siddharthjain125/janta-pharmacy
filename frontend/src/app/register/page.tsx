'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';

/**
 * Register Page
 *
 * User registration form with phone number, password, and optional email.
 * Redirects to login on successful registration.
 */
export default function RegisterPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { register, isLoading, isAuthenticated, error, clearError } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push(ROUTES.HOME);
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    clearError();

    // Validation
    if (!phoneNumber.trim()) {
      setLocalError('Phone number is required');
      return;
    }
    if (!password) {
      setLocalError('Password is required');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (email && !email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    try {
      const result = await register({
        phoneNumber: phoneNumber.trim(),
        password,
        email: email.trim() || undefined,
        name: name.trim() || undefined,
      });

      setSuccessMessage(result.message || 'Registration successful! Please login.');

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 2000);
    } catch {
      // Error is handled by auth context
    }
  };

  const displayError = localError || error;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.subtitle}>Join Janta Pharmacy today</p>

        {displayError && (
          <div style={styles.error} role="alert">
            {displayError}
          </div>
        )}

        {successMessage && (
          <div style={styles.success} role="status">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="phoneNumber" style={styles.label}>
              Phone Number <span style={styles.required}>*</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+92 300 1234567"
              style={styles.input}
              autoComplete="tel"
              disabled={isLoading || !!successMessage}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="name" style={styles.label}>
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={styles.input}
              autoComplete="name"
              disabled={isLoading || !!successMessage}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              autoComplete="email"
              disabled={isLoading || !!successMessage}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Password <span style={styles.required}>*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              style={styles.input}
              autoComplete="new-password"
              disabled={isLoading || !!successMessage}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm Password <span style={styles.required}>*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              style={styles.input}
              autoComplete="new-password"
              disabled={isLoading || !!successMessage}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: isLoading || successMessage ? 0.7 : 1,
              cursor: isLoading || successMessage ? 'not-allowed' : 'pointer',
            }}
            disabled={isLoading || !!successMessage}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link href={ROUTES.LOGIN} style={styles.link}>
            Sign in
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
    maxWidth: '440px',
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
  success: {
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    color: '#16a34a',
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
  required: {
    color: '#dc2626',
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

