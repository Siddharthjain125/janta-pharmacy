/**
 * Password Hasher Interface
 *
 * Defines the contract for password hashing operations.
 * This abstraction allows swapping hashing implementations
 * (bcrypt, argon2, scrypt) without affecting consumers.
 *
 * Design decisions:
 * - Async methods to support CPU-intensive hashing
 * - No knowledge of storage or user context
 * - Stateless operations
 */

/**
 * Injection token for the password hasher
 */
export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

/**
 * Password hasher contract
 */
export interface IPasswordHasher {
  /**
   * Hash a plain text password
   * @param plainText The plain text password to hash
   * @returns The hashed password (includes salt for bcrypt)
   */
  hash(plainText: string): Promise<string>;

  /**
   * Compare a plain text password against a hash
   * @param plainText The plain text password to verify
   * @param hash The stored hash to compare against
   * @returns true if the password matches, false otherwise
   */
  compare(plainText: string, hash: string): Promise<boolean>;
}

