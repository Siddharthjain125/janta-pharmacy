/**
 * Authenticated user context attached to request
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * User roles for authorization
 */
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  PHARMACIST = 'PHARMACIST',
  ADMIN = 'ADMIN',
}

/**
 * Extended Express Request with auth context
 */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

