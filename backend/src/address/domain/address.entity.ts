/**
 * Address Aggregate Root
 *
 * Represents a user-owned address stored as a first-class aggregate.
 * Address lifecycle is managed independently of the User aggregate.
 */
export interface Address {
  readonly id: string;
  readonly userId: string;
  readonly label: string;
  readonly line1: string;
  readonly line2: string | null;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly isDefault: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Data required to create a new address
 */
export interface CreateAddressData {
  userId: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

/**
 * Data that can be updated on an address
 */
export interface UpdateAddressData {
  label?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

/**
 * Factory function to create a new Address aggregate
 */
export function createAddress(
  id: string,
  data: CreateAddressData,
  now: Date = new Date(),
): Address {
  return {
    id,
    userId: data.userId,
    label: data.label,
    line1: data.line1,
    line2: data.line2 ?? null,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country,
    isDefault: data.isDefault ?? false,
    createdAt: now,
    updatedAt: now,
  };
}
