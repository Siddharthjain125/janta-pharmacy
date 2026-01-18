'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/lib/constants';
import type { ApiError } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export default function ProfileContextPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [contextData, setContextData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContext = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<unknown>('/users/me/context');
      setContextData(response.data ?? null);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load context'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    loadContext();
  }, [isAuthLoading, isAuthenticated, loadContext]);

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">User Context</h1>
          <p className="text-sm text-muted-foreground">Internal / Demo – Read-only</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href={ROUTES.PROFILE} className="text-primary hover:underline">
              Back to profile
            </Link>
            <Link href={ROUTES.PROFILE_ADDRESSES} className="text-primary hover:underline">
              Manage addresses
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Context payload</CardTitle>
            <CardDescription>Raw backend composition data for demos.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-sm text-muted-foreground">Loading context...</p>}
            {!isLoading && error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {!isLoading && !error && (
              <pre className="max-h-[500px] overflow-auto rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                {JSON.stringify(contextData, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'error' in error) {
    const apiError = error as ApiError;
    if (apiError.error?.message) {
      return apiError.error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
