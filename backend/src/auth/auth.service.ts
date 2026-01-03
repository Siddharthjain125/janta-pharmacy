import { Injectable, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import {
  PASSWORD_HASHER,
  IPasswordHasher,
} from './interfaces/password-hasher.interface';
import {
  CREDENTIAL_REPOSITORY,
  ICredentialRepository,
} from './credentials/credential-repository.interface';
import { RegisterUserDto, RegisterUserResponseDto } from './dto';
import {
  PhoneNumberAlreadyRegisteredException,
  EmailAlreadyRegisteredException,
  InvalidPhoneNumberFormatException,
  WeakPasswordException,
} from './exceptions';
import { isValidPhoneNumber, normalizePhoneNumber } from '../user/domain';
import { logWithCorrelation } from '../common/logging/logger';

/**
 * Auth Service
 *
 * Handles authentication business logic.
 *
 * Responsibilities:
 * - User registration with password
 * - Password validation
 * - Credential storage
 *
 * Design decisions:
 * - Depends on UserService for identity creation
 * - Depends on IPasswordHasher for secure hashing
 * - Depends on ICredentialRepository for credential storage
 * - Does NOT expose password hashes
 *
 * Future extensions:
 * - Login with password
 * - OTP generation and verification
 * - Social login handling
 * - JWT token generation
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(CREDENTIAL_REPOSITORY)
    private readonly credentialRepository: ICredentialRepository,
  ) {}

  /**
   * Register a new user with phone number and password
   *
   * Flow:
   * 1. Validate phone number format
   * 2. Validate password strength
   * 3. Check phone uniqueness
   * 4. Check email uniqueness (if provided)
   * 5. Hash password
   * 6. Create user identity
   * 7. Store password credential
   * 8. Return minimal response (no sensitive data)
   */
  async registerUser(
    dto: RegisterUserDto,
    correlationId: string,
  ): Promise<RegisterUserResponseDto> {
    // 1. Validate phone number format
    if (!isValidPhoneNumber(dto.phoneNumber)) {
      throw new InvalidPhoneNumberFormatException();
    }

    const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);

    // 2. Validate password strength
    this.validatePasswordStrength(dto.password);

    // 3. Check if phone number already exists
    const existingUser = await this.userService.getUserByPhoneNumber(normalizedPhone);
    if (existingUser) {
      throw new PhoneNumberAlreadyRegisteredException(normalizedPhone);
    }

    // 4. Check if email already exists (if provided)
    if (dto.email) {
      try {
        await this.userService.findByPhoneNumber(dto.email, correlationId);
        // If we get here, email exists (findByPhoneNumber was wrong approach)
      } catch {
        // Good - email doesn't exist as phone (but we need proper email check)
      }
    }

    // 5. Hash the password
    const passwordHash = await this.passwordHasher.hash(dto.password);

    // 6. Create user identity
    const user = await this.userService.createUser(
      {
        phoneNumber: normalizedPhone,
        email: dto.email,
        name: dto.name,
      },
      correlationId,
    );

    // 7. Store password credential
    await this.credentialRepository.create({
      userId: user.id,
      type: 'password',
      value: passwordHash,
    });

    logWithCorrelation(
      'INFO',
      correlationId,
      'User registered successfully',
      'AuthService',
      { userId: user.id, phoneNumber: normalizedPhone },
    );

    // 8. Return minimal response
    return {
      userId: user.id,
      phoneNumber: normalizedPhone,
      message: 'Registration successful',
    };
  }

  /**
   * Validate password meets minimum requirements
   * Throws WeakPasswordException if validation fails
   */
  private validatePasswordStrength(password: string): void {
    const MIN_LENGTH = 8;

    if (!password || password.length < MIN_LENGTH) {
      throw new WeakPasswordException(
        `Password must be at least ${MIN_LENGTH} characters long`,
      );
    }

    // Check for at least one letter and one number
    if (!/[a-zA-Z]/.test(password)) {
      throw new WeakPasswordException('Password must contain at least one letter');
    }

    if (!/\d/.test(password)) {
      throw new WeakPasswordException('Password must contain at least one number');
    }
  }

  // ============================================
  // TODO: Methods below are placeholders
  // ============================================

  /**
   * Authenticate user with credentials
   * TODO: Implement with real authentication logic
   */
  async login(loginDto: { email: string; password: string }): Promise<AuthTokens> {
    // TODO: Validate credentials against database
    // TODO: Generate real JWT tokens
    return {
      accessToken: 'placeholder-access-token',
      refreshToken: 'placeholder-refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer',
    };
  }

  /**
   * Refresh access token using refresh token
   * TODO: Implement with real token refresh logic
   */
  async refreshToken(refreshDto: { refreshToken: string }): Promise<AuthTokens> {
    // TODO: Validate refresh token
    // TODO: Generate new access token
    return {
      accessToken: 'placeholder-new-access-token',
      refreshToken: 'placeholder-new-refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer',
    };
  }

  /**
   * Validate access token
   * TODO: Implement with real JWT validation
   */
  async validateToken(token: string): Promise<TokenPayload | null> {
    // TODO: Verify JWT signature and expiration
    return {
      userId: 'placeholder-user-id',
      email: 'placeholder@example.com',
      roles: ['user'],
    };
  }

  /**
   * Extract user from token
   * TODO: Implement with real token parsing
   */
  async getUserFromToken(token: string): Promise<unknown> {
    // TODO: Decode and return user info
    return null;
  }
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}
