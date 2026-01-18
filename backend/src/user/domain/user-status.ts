/**
 * User account status
 *
 * Represents the lifecycle state of a user account.
 * Status transitions are controlled by the UserService.
 */
export enum UserStatus {
  /** Account created, pending verification */
  PENDING = 'PENDING',

  /** Account is active and can perform actions */
  ACTIVE = 'ACTIVE',

  /** Account temporarily suspended (e.g., suspicious activity) */
  SUSPENDED = 'SUSPENDED',

  /** Account permanently deactivated */
  DEACTIVATED = 'DEACTIVATED',
}

/**
 * Metadata for user statuses
 */
export const USER_STATUS_METADATA: Record<
  UserStatus,
  { description: string; canAuthenticate: boolean }
> = {
  [UserStatus.PENDING]: {
    description: 'Account pending verification',
    canAuthenticate: false,
  },
  [UserStatus.ACTIVE]: {
    description: 'Account is active',
    canAuthenticate: true,
  },
  [UserStatus.SUSPENDED]: {
    description: 'Account is suspended',
    canAuthenticate: false,
  },
  [UserStatus.DEACTIVATED]: {
    description: 'Account is deactivated',
    canAuthenticate: false,
  },
};

/**
 * Check if a user status allows authentication
 */
export function canAuthenticate(status: UserStatus): boolean {
  return USER_STATUS_METADATA[status]?.canAuthenticate ?? false;
}
