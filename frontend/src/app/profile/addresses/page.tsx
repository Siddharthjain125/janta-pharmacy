'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/lib/constants';
import type { ApiError } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';

interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressFormState {
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  makeDefault: boolean;
}

const emptyFormState: AddressFormState = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  makeDefault: false,
};

export default function AddressManagementPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formState, setFormState] = useState<AddressFormState>(emptyFormState);

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.get<Address[]>('/addresses');
      setAddresses(response.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load addresses'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    loadAddresses();
  }, [isAuthLoading, isAuthenticated, loadAddresses]);

  const openAddDialog = () => {
    setEditingAddress(null);
    setFormState(emptyFormState);
    setDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormState({
      label: address.label,
      line1: address.line1,
      line2: address.line2 ?? '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      makeDefault: false,
    });
    setDialogOpen(true);
  };

  const dialogTitle = editingAddress ? 'Edit address' : 'Add address';

  const defaultAddressId = useMemo(
    () => addresses.find((address) => address.isDefault)?.id ?? null,
    [addresses],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const label = formState.label.trim();
    const line1 = formState.line1.trim();
    const city = formState.city.trim();
    const state = formState.state.trim();
    const postalCode = formState.postalCode.trim();
    const country = formState.country.trim();

    if (!label || !line1 || !city || !state || !postalCode || !country) {
      setError('Please fill in all required fields');
      return;
    }

    const payload = {
      label,
      line1,
      line2: formState.line2.trim() ? formState.line2.trim() : null,
      city,
      state,
      postalCode,
      country,
      ...(formState.makeDefault ? { isDefault: true } : {}),
    };

    setIsSaving(true);

    try {
      if (editingAddress) {
        await apiClient.patch<Address>(`/addresses/${editingAddress.id}`, payload);
        setSuccess('Address updated');
      } else {
        await apiClient.post<Address>('/addresses', payload);
        setSuccess('Address added');
      }
      setDialogOpen(false);
      setEditingAddress(null);
      setFormState(emptyFormState);
      await loadAddresses();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save address'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await apiClient.patch<Address>(`/addresses/${addressId}`, { isDefault: true });
      setSuccess('Default address updated');
      await loadAddresses();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to set default address'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    const confirmed = window.confirm('Delete this address? This action cannot be undone.');
    if (!confirmed) return;

    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await apiClient.delete<{ id: string; deleted: boolean }>(`/addresses/${addressId}`);
      setSuccess('Address deleted');
      await loadAddresses();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete address'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">My Addresses</h1>
          <p className="text-sm text-muted-foreground">
            Manage your saved delivery addresses. Only your addresses are visible.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href={ROUTES.PROFILE} className="text-primary hover:underline">
              Back to profile
            </Link>
            <Link href={ROUTES.PROFILE_CONTEXT} className="text-primary hover:underline">
              View context (demo)
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Saved Addresses</CardTitle>
              <CardDescription>
                Add, edit, set default, or delete your addresses.
              </CardDescription>
            </div>
            <Button onClick={openAddDialog}>Add address</Button>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-sm text-muted-foreground">Loading addresses...</p>}

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

            {!isLoading && addresses.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No addresses saved yet. Add one to get started.
              </div>
            )}

            {!isLoading && addresses.length > 0 && (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="rounded-lg border p-4 shadow-sm transition-colors hover:border-muted-foreground/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">{address.label}</h3>
                        {address.isDefault && <Badge>Default</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!address.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetDefault(address.id)}
                            disabled={isSaving}
                          >
                            Set default
                          </Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => openEditDialog(address)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(address.id)}
                          disabled={isSaving}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <p>{address.line1}</p>
                      {address.line2 && <p>{address.line2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address-label">Label</Label>
                <Input
                  id="address-label"
                  value={formState.label}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, label: event.target.value }))
                  }
                  placeholder="Home, Office"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-line1">Address line 1</Label>
                <Input
                  id="address-line1"
                  value={formState.line1}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, line1: event.target.value }))
                  }
                  placeholder="123 Main Street"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-line2">Address line 2 (optional)</Label>
                <Input
                  id="address-line2"
                  value={formState.line2}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, line2: event.target.value }))
                  }
                  placeholder="Apartment, floor, suite"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address-city">City</Label>
                  <Input
                    id="address-city"
                    value={formState.city}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, city: event.target.value }))
                    }
                    placeholder="Mumbai"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-state">State</Label>
                  <Input
                    id="address-state"
                    value={formState.state}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, state: event.target.value }))
                    }
                    placeholder="MH"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address-postal">Postal code</Label>
                  <Input
                    id="address-postal"
                    value={formState.postalCode}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, postalCode: event.target.value }))
                    }
                    placeholder="400001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-country">Country</Label>
                  <Input
                    id="address-country"
                    value={formState.country}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, country: event.target.value }))
                    }
                    placeholder="India"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formState.makeDefault}
                  disabled={editingAddress?.id === defaultAddressId}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, makeDefault: event.target.checked }))
                  }
                />
                Set as default
              </label>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
