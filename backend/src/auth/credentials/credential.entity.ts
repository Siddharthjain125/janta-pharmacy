/**
 * Credential Entity
 *
 * Represents an authentication credential for a user.
 * Stored separately from User identity to support multiple auth methods.
 *
 * Design decisions:
 * - Each credential has a type (password, otp, social)
 * - A user can have multiple credentials (password + social login)
 * - Credential value is opaque to this entity (could be hash, token, etc.)
 * - No business logic here - just data structure
 *
 * Future extensions:
 * - OTP: type='otp', value=null (OTP is transient)
 * - Social: type='google', value=googleSubjectId
 */

/**
 * Types of authentication credentials
 */
export type CredentialType = 'password' | 'otp' | 'google' | 'facebook';

/**
 * Credential entity
 */
export interface Credential {
  /** Unique identifier */
  readonly id: string;

  /** Reference to user (foreign key) */
  readonly userId: string;

  /** Type of credential */
  readonly type: CredentialType;

  /**
   * The credential value (hashed password, OAuth subject ID, etc.)
   * For OTP: this is null (OTP is validated transiently)
   */
  readonly value: string | null;

  /** When the credential was created */
  readonly createdAt: Date;

  /** When the credential was last updated */
  readonly updatedAt: Date;
}

/**
 * Data required to create a credential
 */
export interface CreateCredentialData {
  userId: string;
  type: CredentialType;
  value: string | null;
}

