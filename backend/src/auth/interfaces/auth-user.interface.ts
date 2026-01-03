/**
 * Auth User Interface
 *
 * Re-exports UserRole from User module for consistency.
 * AuthUser represents the authenticated context attached to requests.
 */

// Re-export UserRole from the User module (single source of truth)
export { UserRole } from '../../user/domain/user-role';

/**
 * Authenticated user context attached to request
 *
 * This is a lightweight representation of the authenticated user,
 * containing only what's needed for authorization decisions.
 *
 * Note: phoneNumber is the primary identifier, but we include
 * email for backwards compatibility and future use.
 */
export interface AuthUser {
  /** User ID */
  id: string;

  /** Phone number (primary identifier) */
  phoneNumber: string;

  /** Email (optional, secondary) */
  email: string | null;

  /** Primary role for authorization */
  role: import('../../user/domain/user-role').UserRole;

  /** All roles (for multi-role scenarios) */
  roles: import('../../user/domain/user-role').UserRole[];
}

/**
 * Extended Express Request with auth context
 */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

/**
 * Create AuthUser from User entity
 */
export function toAuthUser(user: {
  id: string;
  phoneNumber: string;
  email: string | null;
  roles: import('../../user/domain/user-role').UserRole[];
}): AuthUser {
  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    email: user.email,
    role: user.roles[0], // Primary role is first role
    roles: user.roles,
  };
}
