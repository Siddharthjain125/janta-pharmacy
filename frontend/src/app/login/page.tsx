'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';

/**
 * Login Page
 * 
 * Simple login form for authentication.
 * Currently uses mock authentication.
 * 
 * TODO: Add form validation
 * TODO: Add error handling
 * TODO: Add password visibility toggle
 * TODO: Add "forgot password" link
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push(ROUTES.HOME);
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
    router.push(ROUTES.HOME);
  };

  return (
    <div style={styles.container}>
      <h1>Login</h1>
      <p style={styles.subtitle}>Sign in to your account</p>

      <form onSubmit={handleSubmit} style={styles.form}>
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
            required
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
            required
          />
        </div>

        <button type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={styles.note}>
        <strong>Dev Mode:</strong> Any credentials will work (mock auth).
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
  },
  subtitle: {
    color: '#666',
    marginBottom: '2rem',
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
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    background: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  note: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '0.875rem',
  },
};

