'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    if (!name.trim()) {
      setLocalError('Name is required');
      return;
    }
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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-8">
      <Card className="w-full max-w-[440px]">
        <CardHeader>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Join Janta Pharmacy today</CardDescription>
        </CardHeader>
        
        <CardContent>
          {displayError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm" role="alert">
              {displayError}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm" role="status">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div className="space-y-2">
              <Label htmlFor="register-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="register-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                disabled={isLoading || !!successMessage}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="register-phone"
                name="tel"
                type="tel"
                inputMode="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 900 9090467"
                autoComplete="tel"
                disabled={isLoading || !!successMessage}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading || !!successMessage}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="register-password"
                name="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                disabled={isLoading || !!successMessage}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="register-confirm-password"
                name="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                disabled={isLoading || !!successMessage}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full mt-2" 
              disabled={isLoading || !!successMessage}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
