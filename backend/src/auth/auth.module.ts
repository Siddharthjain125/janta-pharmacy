import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PASSWORD_HASHER } from './interfaces/password-hasher.interface';
import { BcryptPasswordHasher } from './infrastructure/bcrypt-password-hasher';
import { CREDENTIAL_REPOSITORY } from './credentials/credential-repository.interface';
import { InMemoryCredentialRepository } from './credentials/in-memory-credential.repository';
import { REFRESH_TOKEN_REPOSITORY } from './refresh-tokens/refresh-token-repository.interface';
import { InMemoryRefreshTokenRepository } from './refresh-tokens/in-memory-refresh-token.repository';
import { UserModule } from '../user/user.module';
import { getJwtConfig } from './config/jwt.config';

/**
 * Auth Module
 *
 * Handles authentication and authorization concerns.
 *
 * Responsibilities:
 * - User registration with password
 * - User login with password
 * - Password hashing (pluggable implementation)
 * - Credential storage
 * - JWT token generation and validation
 * - Authentication guards
 * - Role-based authorization
 *
 * Dependencies:
 * - UserModule: For user identity management
 * - JwtModule: For token generation/validation
 *
 * Design decisions:
 * - Password hashing is behind an interface (IPasswordHasher)
 * - Credential storage is behind an interface (ICredentialRepository)
 * - BcryptPasswordHasher is the default, can be swapped
 * - In-memory credential storage for now, will be replaced with DB
 * - Guards are exported for use in other modules
 * - JWT config is centralized and env-based
 *
 * Future extensions:
 * - Refresh token support
 * - OTP verification (new provider, same interface pattern)
 * - Social login (OAuth providers)
 * - Session management
 */
@Module({
  imports: [
    UserModule, // For user identity management

    // JWT configuration
    JwtModule.registerAsync({
      useFactory: () => {
        const config = getJwtConfig();
        return {
          secret: config.secret,
          signOptions: {
            expiresIn: config.expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
            issuer: config.issuer,
          },
        };
      },
    }),
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

    // Refresh token storage - in-memory for now
    // Replace with Redis or database implementation in production
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: InMemoryRefreshTokenRepository,
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
    JwtModule, // Export for use in guards
    PASSWORD_HASHER, // Export for testing/mocking
    CREDENTIAL_REPOSITORY, // Export for testing/mocking
    REFRESH_TOKEN_REPOSITORY, // Export for testing/mocking
  ],
})
export class AuthModule {}
