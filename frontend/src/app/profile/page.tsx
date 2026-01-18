'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/lib/constants';
import type { ApiError } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';

interface UserProfile {
  id: string;
  phoneNumber: string;
  email: string | null;
  name: string | null;
  roles: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileFormState {
  name: string;
  phoneNumber: string;
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formState, setFormState] = useState<ProfileFormState>({
    name: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.get<UserProfile>('/users/me');
      if (!response.data) {
        throw new Error('Profile response was empty');
      }
      setProfile(response.data);
      setFormState({
        name: response.data.name ?? '',
        phoneNumber: response.data.phoneNumber ?? '',
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load profile'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    loadProfile();
  }, [isAuthLoading, isAuthenticated, loadProfile]);

  const roles = useMemo(() => profile?.roles ?? [], [profile]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!profile) {
      setError('Profile not loaded yet');
      return;
    }

    const nameTrimmed = formState.name.trim();
    const phoneTrimmed = formState.phoneNumber.trim();

    if (formState.name !== '' && nameTrimmed.length === 0) {
      setError('Name cannot be empty');
      return;
    }

    if (formState.phoneNumber !== '' && phoneTrimmed.length === 0) {
      setError('Phone number cannot be empty');
      return;
    }

    const payload: { name?: string; phoneNumber?: string } = {};

    if (nameTrimmed && nameTrimmed !== (profile.name ?? '')) {
      payload.name = nameTrimmed;
    }

    if (phoneTrimmed && phoneTrimmed !== profile.phoneNumber) {
      payload.phoneNumber = phoneTrimmed;
    }

    if (Object.keys(payload).length === 0) {
      setError('No changes to save');
      return;
    }

    setIsSaving(true);

    try {
      const response = await apiClient.patch<UserProfile>('/users/me', payload);
      if (!response.data) {
        throw new Error('Profile update returned no data');
      }
      setProfile(response.data);
      setFormState({
        name: response.data.name ?? '',
        phoneNumber: response.data.phoneNumber ?? '',
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to update profile'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <p className="text-sm text-muted-foreground">
            Self-service profile details. Email and password changes are not available.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href={ROUTES.PROFILE_ADDRESSES} className="text-primary hover:underline">
              Manage addresses
            </Link>
            <Link href={ROUTES.PROFILE_CONTEXT} className="text-primary hover:underline">
              View context (demo)
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Only name and phone number can be edited.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-sm text-muted-foreground">Loading profile...</p>}

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

            {!isLoading && profile && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Name</Label>
                  <Input
                    id="profile-name"
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Your name"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-phone">Phone Number</Label>
                  <Input
                    id="profile-phone"
                    value={formState.phoneNumber}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, phoneNumber: event.target.value }))
                    }
                    placeholder="+91 900 9090467"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Roles</Label>
                  <div className="flex flex-wrap gap-2">
                    {roles.length === 0 && (
                      <span className="text-sm text-muted-foreground">No roles assigned</span>
                    )}
                    {roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
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
