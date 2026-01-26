'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/lib/constants';
import type { ApiError } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

interface Prescription {
  id: string;
  userId: string;
  fileReference: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export default function PrescriptionsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrescriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<Prescription[]>('/prescriptions');
      setPrescriptions(response.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load prescriptions'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    loadPrescriptions();
  }, [isAuthLoading, isAuthenticated, loadPrescriptions]);

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">My Prescriptions</h1>
          <p className="text-sm text-muted-foreground">
            Track prescription status. Submissions are reviewed by admin.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href={ROUTES.PRESCRIPTION_NEW} className="text-primary hover:underline">
              Submit a prescription
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Prescription History</CardTitle>
              <CardDescription>Status updates appear here.</CardDescription>
            </div>
            <Button asChild>
              <Link href={ROUTES.PRESCRIPTION_NEW}>New submission</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-sm text-muted-foreground">Loading prescriptions...</p>}

            {!isLoading && error && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {!isLoading && prescriptions.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No prescriptions submitted yet.
              </div>
            )}

            {!isLoading && prescriptions.length > 0 && (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="rounded-lg border p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">
                          {prescription.fileReference}
                        </h3>
                        <StatusBadge status={prescription.status} />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(prescription.createdAt)}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <p>Reference: {prescription.fileReference}</p>
                      {prescription.rejectionReason && (
                        <p className="text-destructive">Reason: {prescription.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

function StatusBadge({ status }: { status: Prescription['status'] }) {
  if (status === 'APPROVED') {
    return <Badge className="bg-emerald-600">Approved</Badge>;
  }
  if (status === 'REJECTED') {
    return <Badge className="bg-destructive">Rejected</Badge>;
  }
  return <Badge variant="secondary">Pending</Badge>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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
