/**
 * User roles for authorization
 *
 * Roles determine what actions a user can perform.
 * A user can have multiple roles.
 */
export enum UserRole {
  /** Regular customer placing orders */
  CUSTOMER = 'CUSTOMER',

  /** Pharmacy staff with limited admin access */
  STAFF = 'STAFF',

  /** Licensed pharmacist for prescription verification */
  PHARMACIST = 'PHARMACIST',

  /** Full system administrator */
  ADMIN = 'ADMIN',
}

/**
 * Role hierarchy for permission checks
 * Higher index = more permissions
 */
export const ROLE_HIERARCHY: UserRole[] = [
  UserRole.CUSTOMER,
  UserRole.STAFF,
  UserRole.PHARMACIST,
  UserRole.ADMIN,
];

/**
 * Check if a role has at least the required permission level
 */
export function hasMinimumRole(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

/**
 * Default role for new users
 */
export const DEFAULT_USER_ROLE = UserRole.CUSTOMER;

