/**
 * User Module Public API
 *
 * Only export what other modules should use.
 * Internal implementation details stay hidden.
 */

// Module
export { UserModule } from './user.module';

// Service (for DI in other modules)
export { UserService } from './user.service';

// Domain types (for type safety)
export {
  User,
  UserStatus,
  UserRole,
  canAuthenticate,
  hasMinimumRole,
} from './domain';

// DTOs (for API contracts)
export { UserDto, UserSelfDto, CreateUserDto, UpdateUserDto } from './dto';

// Repository interface (for testing/mocking)
export { USER_REPOSITORY, IUserRepository } from './repositories';

