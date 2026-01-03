import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { USER_REPOSITORY } from './repositories/user-repository.interface';
import { InMemoryUserRepository } from './repositories/in-memory-user.repository';

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
 * Exports:
 * - UserService: For other modules to look up users
 * - User types: For type safety across modules
 */
@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
  ],
  exports: [
    UserService,
    // Export repository token for testing
    USER_REPOSITORY,
  ],
})
export class UserModule {}
