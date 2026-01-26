'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/lib/constants';
import type { ApiError } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Prescription {
  id: string;
  userId: string;
  fileReference: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

type RejectState = Record<string, string>;

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<RejectState>({});

  const loadPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.get<Prescription[]>('/admin/prescriptions/pending');
      setPrescriptions(response.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load pending prescriptions'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleApprove = async (id: string) => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await apiClient.post<Prescription>(`/admin/prescriptions/${id}/approve`);
      setSuccess('Prescription approved');
      setPrescriptions((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to approve prescription'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async (id: string) => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await apiClient.post<Prescription>(`/admin/prescriptions/${id}/reject`, {
        rejectionReason: rejectReasons[id] || undefined,
      });
      setSuccess('Prescription rejected');
      setPrescriptions((prev) => prev.filter((item) => item.id !== id));
      setRejectReasons((prev) => ({ ...prev, [id]: '' }));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to reject prescription'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Admin Review</h1>
          <p className="text-sm text-muted-foreground">
            Review and decide on pending prescriptions.
          </p>
          <p className="text-sm text-muted-foreground">Route: {ROUTES.ADMIN_PRESCRIPTIONS}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Prescriptions</CardTitle>
            <CardDescription>Approve or reject each item.</CardDescription>
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

            {!isLoading && prescriptions.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No pending prescriptions.
              </div>
            )}

            {!isLoading && prescriptions.length > 0 && (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="rounded-lg border p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">
                          {prescription.fileReference}
                        </h3>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(prescription.createdAt)}
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground">
                      <p>User ID: {prescription.userId}</p>
                      <p>Reference: {prescription.fileReference}</p>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
                      <div className="space-y-2">
                        <Label htmlFor={`reject-${prescription.id}`}>Rejection reason</Label>
                        <Input
                          id={`reject-${prescription.id}`}
                          value={rejectReasons[prescription.id] ?? ''}
                          onChange={(event) =>
                            setRejectReasons((prev) => ({
                              ...prev,
                              [prescription.id]: event.target.value,
                            }))
                          }
                          placeholder="Optional reason"
                          disabled={isSaving}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => handleApprove(prescription.id)}
                        disabled={isSaving}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(prescription.id)}
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
