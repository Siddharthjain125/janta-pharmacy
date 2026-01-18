import { Credential, CreateCredentialData, CredentialType } from './credential.entity';

/**
 * Injection token for the credential repository
 */
export const CREDENTIAL_REPOSITORY = Symbol('CREDENTIAL_REPOSITORY');

/**
 * Credential Repository Interface
 *
 * Defines the contract for credential data access.
 * Implementations can be in-memory, Prisma, or any other storage.
 *
 * Design notes:
 * - All methods are async for consistency
 * - Credentials are tied to users but stored separately
 * - A user can have multiple credentials of different types
 * - Only one credential per type per user is allowed
 */
export interface ICredentialRepository {
  /**
   * Create a new credential
   * @throws if credential of same type already exists for user
   */
  create(data: CreateCredentialData): Promise<Credential>;

  /**
   * Find credential by user ID and type
   * @returns Credential or null if not found
   */
  findByUserIdAndType(userId: string, type: CredentialType): Promise<Credential | null>;

  /**
   * Find all credentials for a user
   */
  findAllByUserId(userId: string): Promise<Credential[]>;

  /**
   * Update a credential value
   * @returns Updated credential or null if not found
   */
  update(id: string, value: string | null): Promise<Credential | null>;

  /**
   * Delete a credential
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Delete all credentials for a user
   */
  deleteAllByUserId(userId: string): Promise<void>;

  /**
   * Check if user has a credential of given type
   */
  hasCredential(userId: string, type: CredentialType): Promise<boolean>;
}
