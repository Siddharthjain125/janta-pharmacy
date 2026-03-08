'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/lib/constants';
import type { ApiError } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentIntentReviewItem {
  id: string;
  orderId: string;
  method: 'UPI' | 'COD';
  status: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  referenceId?: string | null;
  proofReference?: string | null;
  createdAt: string;
  verifiedAt?: string | null;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentIntentReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.get<PaymentIntentReviewItem[]>('/admin/payments/pending');
      setPayments(response.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load pending payments'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleVerify = async (id: string) => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await apiClient.post<PaymentIntentReviewItem>(`/admin/payments/${id}/verify`);
      setSuccess('Payment verified');
      setPayments((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to verify payment'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async (id: string) => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await apiClient.post<PaymentIntentReviewItem>(`/admin/payments/${id}/reject`);
      setSuccess('Payment rejected');
      setPayments((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to reject payment'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Payments Review</h1>
          <p className="text-sm text-muted-foreground">
            Review submitted UPI payments and verify or reject them.
          </p>
          <p className="text-sm text-muted-foreground">Route: {ROUTES.ADMIN_PAYMENTS}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
            <CardDescription>Only submitted UPI payments require review.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-sm text-muted-foreground">Loading pending...</p>}

            {!isLoading && error && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {!isLoading && success && (
              <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {!isLoading && payments.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No pending payments.
              </div>
            )}

            {!isLoading && payments.length > 0 && (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="rounded-lg border p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">Order #{payment.orderId}</h3>
                        <Badge variant="secondary">Submitted</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground">
                      <p>Payment Intent ID: {payment.id}</p>
                      <p>Method: {payment.method}</p>
                      <p>Reference ID: {payment.referenceId || 'N/A'}</p>
                      <p>Proof: {payment.proofReference || 'N/A'}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleVerify(payment.id)}
                        disabled={isSaving}
                      >
                        Verify
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(payment.id)}
                        disabled={isSaving}
                      >
                        Reject
                      </Button>
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
