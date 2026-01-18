import { UserStatus } from './user-status';
import { UserRole, DEFAULT_USER_ROLE } from './user-role';

/**
 * User Entity
 *
 * Represents a user's identity in the system.
 * This is the core identity object - authentication methods
 * (password, OTP, social login) are handled separately.
 *
 * Design decisions:
 * - phoneNumber is the primary identifier (required, unique)
 * - email is secondary and optional
 * - roles is an array to support future multi-role scenarios
 * - No authentication data here (passwords, tokens)
 */
export interface User {
  /** Unique identifier (UUID) */
  readonly id: string;

  /** Primary identifier - unique phone number with country code */
  readonly phoneNumber: string;

  /** Optional email address */
  readonly email: string | null;

  /** Display name (optional) */
  readonly name: string | null;

  /** User roles for authorization */
  readonly roles: UserRole[];

  /** Account status */
  readonly status: UserStatus;

  /** When the account was created */
  readonly createdAt: Date;

  /** When the account was last updated */
  readonly updatedAt: Date;
}

/**
 * Data required to create a new user
 */
export interface CreateUserData {
  phoneNumber: string;
  email?: string | null;
  name?: string | null;
  roles?: UserRole[];
}

/**
 * Data that can be updated on a user
 */
export interface UpdateUserData {
  phoneNumber?: string;
  email?: string | null;
  name?: string | null;
  roles?: UserRole[];
  status?: UserStatus;
}

/**
 * Factory function to create a new User
 * Ensures all invariants are satisfied
 */
export function createUser(id: string, data: CreateUserData, now: Date = new Date()): User {
  return {
    id,
    phoneNumber: normalizePhoneNumber(data.phoneNumber),
    email: data.email ?? null,
    name: data.name ?? null,
    roles: data.roles ?? [DEFAULT_USER_ROLE],
    status: UserStatus.ACTIVE, // New users are active by default
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Normalize phone number to consistent format
 * Removes spaces, dashes, and ensures + prefix
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');

  // Ensure + prefix if not present
  if (!normalized.startsWith('+')) {
    // Assume Indian number if no country code
    normalized = '+91' + normalized;
  }

  return normalized;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // Basic validation: + followed by 10-15 digits
  return /^\+\d{10,15}$/.test(normalized);
}
