'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/lib/constants';
import type { ApiError } from '@/types/api';
import { Button } from '@/components/ui/button';
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

export default function SubmitPrescriptionPage() {
  const router = useRouter();
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fileName) {
      setError('Please select a file to submit');
      return;
    }

    setIsSubmitting(true);

    try {
      const fileReference = `${Date.now()}-${fileName}`;
      await apiClient.post<Prescription>('/prescriptions', { fileReference });
      setSuccess('Prescription submitted');
      setTimeout(() => router.push(ROUTES.PRESCRIPTIONS), 600);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to submit prescription'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Submit Prescription</h1>
          <p className="text-sm text-muted-foreground">
            Demo-only submission. File content is not uploaded.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href={ROUTES.PRESCRIPTIONS} className="text-primary hover:underline">
              Back to prescriptions
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prescription file</CardTitle>
            <CardDescription>Attach any file to generate a reference.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prescription-file">File</Label>
                <Input
                  id="prescription-file"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setFileName(file ? file.name : '');
                  }}
                  disabled={isSubmitting}
                />
                {fileName && (
                  <p className="text-xs text-muted-foreground">Selected: {fileName}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
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
