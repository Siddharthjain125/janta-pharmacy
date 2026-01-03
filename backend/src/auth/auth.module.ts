import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PASSWORD_HASHER } from './interfaces/password-hasher.interface';
import { BcryptPasswordHasher } from './infrastructure/bcrypt-password-hasher';
import { CREDENTIAL_REPOSITORY } from './credentials/credential-repository.interface';
import { InMemoryCredentialRepository } from './credentials/in-memory-credential.repository';
import { UserModule } from '../user/user.module';

/**
 * Auth Module
 *
 * Handles authentication and authorization concerns.
 *
 * Responsibilities:
 * - User registration with password
 * - Password hashing (pluggable implementation)
 * - Credential storage
 * - JWT token management (planned)
 * - Authentication guards
 * - Role-based authorization
 *
 * Dependencies:
 * - UserModule: For user identity management
 *
 * Design decisions:
 * - Password hashing is behind an interface (IPasswordHasher)
 * - Credential storage is behind an interface (ICredentialRepository)
 * - BcryptPasswordHasher is the default, can be swapped
 * - In-memory credential storage for now, will be replaced with DB
 * - Guards are exported for use in other modules
 *
 * Future extensions:
 * - Login with password
 * - OTP verification (new provider, same interface pattern)
 * - Social login (OAuth providers)
 * - JWT generation and validation
 * - Session management
 */
@Module({
  imports: [
    UserModule, // For user identity management
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,

    // Password hashing - pluggable implementation
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },

    // Credential storage - in-memory for now
    {
      provide: CREDENTIAL_REPOSITORY,
      useClass: InMemoryCredentialRepository,
    },

    // Register guards globally (optional - can also use @UseGuards per controller)
    // Uncomment to enable global auth:
    // { provide: APP_GUARD, useClass: JwtAuthGuard },
    // { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    PASSWORD_HASHER, // Export for testing/mocking
    CREDENTIAL_REPOSITORY, // Export for testing/mocking
  ],
})
export class AuthModule {}
