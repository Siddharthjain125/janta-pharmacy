import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PASSWORD_HASHER } from './interfaces/password-hasher.interface';
import { BcryptPasswordHasher } from './infrastructure/bcrypt-password-hasher';

/**
 * Auth Module
 *
 * Handles authentication and authorization concerns.
 *
 * Responsibilities:
 * - Password hashing (pluggable implementation)
 * - JWT token management (planned)
 * - Authentication guards
 * - Role-based authorization
 *
 * Design decisions:
 * - Password hashing is behind an interface (IPasswordHasher)
 * - BcryptPasswordHasher is the default, can be swapped
 * - Guards are exported for use in other modules
 * - Does NOT depend on User module directly (loose coupling)
 *
 * Future extensions:
 * - OTP verification (new provider, same interface pattern)
 * - Social login (OAuth providers)
 * - Session management
 */
@Module({
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
  ],
})
export class AuthModule {}
