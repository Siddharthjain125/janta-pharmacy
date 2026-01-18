import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { USER_REPOSITORY } from './repositories/user-repository.interface';
import { UserRepositoryProvider } from '../database/repository.providers';
import { AuthModule } from '../auth/auth.module';

/**
 * User Module
 *
 * Handles user identity management.
 *
 * Responsibilities:
 * - User creation (registration)
 * - User lookup by ID, phone, email
 * - User profile management
 * - User status management
 *
 * Boundaries:
 * - Does NOT handle authentication (passwords, tokens, OTP)
 * - Does NOT handle authorization (that's in AuthModule)
 * - Other modules depend on UserService for identity
 *
 * Repository Selection:
 * - Uses REPOSITORY_TYPE env var or auto-detects from DATABASE_URL
 * - 'memory': InMemoryUserRepository (tests, dev without DB)
 * - 'prisma': PrismaUserRepository (production, dev with DB)
 *
 * Exports:
 * - UserService: For other modules to look up users
 * - User types: For type safety across modules
 */
@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepositoryProvider,
  ],
  exports: [
    UserService,
    // Export repository token for testing
    USER_REPOSITORY,
  ],
})
export class UserModule {}
