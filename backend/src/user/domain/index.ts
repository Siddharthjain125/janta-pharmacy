/**
 * User Domain Exports
 *
 * Only export what other modules need.
 * Internal implementation details stay hidden.
 */

// Entity and factory
export {
  User,
  CreateUserData,
  UpdateUserData,
  createUser,
  normalizePhoneNumber,
  isValidPhoneNumber,
} from './user.entity';

// Status enum and helpers
export {
  UserStatus,
  USER_STATUS_METADATA,
  canAuthenticate,
} from './user-status';

// Role enum and helpers
export {
  UserRole,
  ROLE_HIERARCHY,
  hasMinimumRole,
  DEFAULT_USER_ROLE,
} from './user-role';

