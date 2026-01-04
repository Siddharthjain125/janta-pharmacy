import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PASSWORD_HASHER } from './interfaces/password-hasher.interface';
import { BcryptPasswordHasher } from './infrastructure/bcrypt-password-hasher';
import { CREDENTIAL_REPOSITORY } from './credentials/credential-repository.interface';
import { InMemoryCredentialRepository } from './credentials/in-memory-credential.repository';
import { REFRESH_TOKEN_REPOSITORY } from './refresh-tokens/refresh-token-repository.interface';
import { InMemoryRefreshTokenRepository } from './refresh-tokens/in-memory-refresh-token.repository';
import { USER_REPOSITORY } from '../user/repositories/user-repository.interface';
import { InMemoryUserRepository } from '../user/repositories/in-memory-user.repository';
import {
  PhoneNumberAlreadyRegisteredException,
  InvalidPhoneNumberFormatException,
  WeakPasswordException,
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  RefreshTokenExpiredException,
  RefreshTokenRevokedException,
} from './exceptions';

/**
 * AuthService Tests
 *
 * These tests validate the behavior of user registration and login flows.
 * They use real implementations (not mocks) to ensure realistic behavior.
 *
 * Design decisions:
 * - Real InMemoryUserRepository (fast, no DB)
 * - Real BcryptPasswordHasher (validates actual hashing)
 * - Real InMemoryCredentialRepository (validates credential storage)
 * - Real JwtService with test secret
 * - Focus on observable behavior, not implementation details
 */
describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: InMemoryUserRepository;
  let credentialRepository: InMemoryCredentialRepository;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let passwordHasher: BcryptPasswordHasher;
  let jwtService: JwtService;

  const TEST_JWT_SECRET = 'test-jwt-secret-for-testing-only';

  beforeEach(async () => {
    // Create fresh instances for each test
    userRepository = new InMemoryUserRepository();
    credentialRepository = new InMemoryCredentialRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    passwordHasher = new BcryptPasswordHasher();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: '15m', issuer: 'janta-pharmacy' },
        }),
      ],
      providers: [
        AuthService,
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: userRepository,
        },
        {
          provide: PASSWORD_HASHER,
          useValue: passwordHasher,
        },
        {
          provide: CREDENTIAL_REPOSITORY,
          useValue: credentialRepository,
        },
        {
          provide: REFRESH_TOKEN_REPOSITORY,
          useValue: refreshTokenRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    // Clean up between tests
    userRepository.clear();
    refreshTokenRepository.clear();
  });

  describe('registerUser', () => {
    const validRegistration = {
      phoneNumber: '+919876543210',
      password: 'SecurePass123',
      name: 'Test User',
    };

    const correlationId = 'test-correlation-id';

    describe('successful registration', () => {
      it('should create a new user with valid data', async () => {
        const result = await authService.registerUser(validRegistration, correlationId);

        expect(result).toBeDefined();
        expect(result.userId).toBeDefined();
        expect(result.phoneNumber).toBe('+919876543210');
        expect(result.message).toBe('Registration successful');
      });

      it('should normalize phone number format', async () => {
        const result = await authService.registerUser(
          {
            phoneNumber: '9876543210', // Without country code
            password: 'SecurePass123',
          },
          correlationId,
        );

        // Should be normalized to include +91
        expect(result.phoneNumber).toBe('+919876543210');
      });

      it('should store password as hash, not plaintext', async () => {
        const plainPassword = 'SecurePass123';

        const result = await authService.registerUser(
          {
            phoneNumber: '+919876543210',
            password: plainPassword,
          },
          correlationId,
        );

        // Verify credential was stored
        const credential = await credentialRepository.findByUserIdAndType(
          result.userId,
          'password',
        );

        expect(credential).toBeDefined();
        expect(credential!.value).toBeDefined();
        // Hash should NOT equal plaintext
        expect(credential!.value).not.toBe(plainPassword);
        // Hash should be a bcrypt hash (starts with $2b$ or $2a$)
        expect(credential!.value).toMatch(/^\$2[ab]\$/);
      });

      it('should create user identity separate from credential', async () => {
        const result = await authService.registerUser(validRegistration, correlationId);

        // User should exist in user repository
        const user = await userRepository.findById(result.userId);
        expect(user).toBeDefined();
        expect(user!.phoneNumber).toBe('+919876543210');
        expect(user!.name).toBe('Test User');

        // Credential should exist in credential repository
        const credential = await credentialRepository.findByUserIdAndType(
          result.userId,
          'password',
        );
        expect(credential).toBeDefined();
        expect(credential!.type).toBe('password');
      });

      it('should allow optional email', async () => {
        const result = await authService.registerUser(
          {
            ...validRegistration,
            email: 'test@example.com',
          },
          correlationId,
        );

        const user = await userRepository.findById(result.userId);
        expect(user!.email).toBe('test@example.com');
      });

      it('should allow registration without email', async () => {
        const result = await authService.registerUser(
          {
            phoneNumber: '+919876543210',
            password: 'SecurePass123',
          },
          correlationId,
        );

        const user = await userRepository.findById(result.userId);
        expect(user!.email).toBeNull();
      });
    });

    describe('duplicate phone number', () => {
      it('should reject registration with existing phone number', async () => {
        // First registration succeeds
        await authService.registerUser(validRegistration, correlationId);

        // Second registration with same phone should fail
        await expect(
          authService.registerUser(
            {
              phoneNumber: '+919876543210',
              password: 'DifferentPass456',
            },
            correlationId,
          ),
        ).rejects.toThrow(PhoneNumberAlreadyRegisteredException);
      });

      it('should reject duplicate even with different formatting', async () => {
        // Register with one format
        await authService.registerUser(
          {
            phoneNumber: '+919876543210',
            password: 'SecurePass123',
          },
          correlationId,
        );

        // Try to register with different format of same number
        await expect(
          authService.registerUser(
            {
              phoneNumber: '9876543210', // Without +91 prefix
              password: 'SecurePass123',
            },
            correlationId,
          ),
        ).rejects.toThrow(PhoneNumberAlreadyRegisteredException);
      });
    });

    describe('phone number validation', () => {
      it('should reject invalid phone number format', async () => {
        await expect(
          authService.registerUser(
            {
              phoneNumber: '123', // Too short
              password: 'SecurePass123',
            },
            correlationId,
          ),
        ).rejects.toThrow(InvalidPhoneNumberFormatException);
      });

      it('should reject phone number with letters', async () => {
        await expect(
          authService.registerUser(
            {
              phoneNumber: '+91ABCD123456',
              password: 'SecurePass123',
            },
            correlationId,
          ),
        ).rejects.toThrow(InvalidPhoneNumberFormatException);
      });
    });

    describe('password validation', () => {
      it('should reject password shorter than 8 characters', async () => {
        await expect(
          authService.registerUser(
            {
              phoneNumber: '+919876543210',
              password: 'Short1',
            },
            correlationId,
          ),
        ).rejects.toThrow(WeakPasswordException);
      });

      it('should reject password without letters', async () => {
        await expect(
          authService.registerUser(
            {
              phoneNumber: '+919876543210',
              password: '12345678',
            },
            correlationId,
          ),
        ).rejects.toThrow(WeakPasswordException);
      });

      it('should reject password without numbers', async () => {
        await expect(
          authService.registerUser(
            {
              phoneNumber: '+919876543210',
              password: 'NoNumbers',
            },
            correlationId,
          ),
        ).rejects.toThrow(WeakPasswordException);
      });

      it('should accept password meeting all requirements', async () => {
        const result = await authService.registerUser(
          {
            phoneNumber: '+919876543210',
            password: 'ValidPass1',
          },
          correlationId,
        );

        expect(result.userId).toBeDefined();
      });
    });

    describe('response safety', () => {
      it('should not include password hash in response', async () => {
        const result = await authService.registerUser(validRegistration, correlationId);

        // Response should only contain safe fields
        expect(result).toEqual({
          userId: expect.any(String),
          phoneNumber: '+919876543210',
          message: 'Registration successful',
        });

        // Ensure no password-related fields leaked
        expect((result as unknown as Record<string, unknown>).password).toBeUndefined();
        expect((result as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
        expect((result as unknown as Record<string, unknown>).hash).toBeUndefined();
      });
    });
  });

  describe('login', () => {
    const correlationId = 'test-correlation-id';

    // Helper to register a user before testing login
    async function registerTestUser(
      phoneNumber = '+919876543210',
      password = 'SecurePass123',
    ) {
      await authService.registerUser({ phoneNumber, password }, correlationId);
      return { phoneNumber, password };
    }

    describe('successful login', () => {
      it('should return access token and refresh token for valid credentials', async () => {
        const { phoneNumber, password } = await registerTestUser();

        const result = await authService.login({ phoneNumber, password }, correlationId);

        expect(result).toBeDefined();
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(result.tokenType).toBe('Bearer');
        expect(result.expiresIn).toBeGreaterThan(0);
      });

      it('should persist refresh token in repository', async () => {
        const { phoneNumber, password } = await registerTestUser();

        const result = await authService.login({ phoneNumber, password }, correlationId);

        // Verify refresh token was stored
        const storedToken = await refreshTokenRepository.findByToken(result.refreshToken);
        expect(storedToken).toBeDefined();
        expect(storedToken!.revokedAt).toBeNull();
      });

      it('should return valid JWT with correct payload', async () => {
        const { phoneNumber, password } = await registerTestUser();

        const result = await authService.login({ phoneNumber, password }, correlationId);

        // Decode and verify the token
        const payload = jwtService.verify(result.accessToken, {
          secret: TEST_JWT_SECRET,
        });

        expect(payload.sub).toBeDefined(); // userId
        expect(payload.phone).toBe('+919876543210');
        expect(payload.roles).toBeDefined();
        expect(payload.type).toBe('access');
      });

      it('should return user info in response', async () => {
        const { phoneNumber, password } = await registerTestUser();

        const result = await authService.login({ phoneNumber, password }, correlationId);

        expect(result.user).toBeDefined();
        expect(result.user.id).toBeDefined();
        expect(result.user.phoneNumber).toBe('+919876543210');
        expect(result.user.roles).toBeDefined();
      });

      it('should normalize phone number during login', async () => {
        await registerTestUser('+919876543210', 'SecurePass123');

        // Login with different format
        const result = await authService.login(
          {
            phoneNumber: '9876543210', // Without +91
            password: 'SecurePass123',
          },
          correlationId,
        );

        expect(result.accessToken).toBeDefined();
      });
    });

    describe('failed login', () => {
      it('should reject non-existent phone number', async () => {
        await expect(
          authService.login(
            {
              phoneNumber: '+919999999999',
              password: 'SomePassword1',
            },
            correlationId,
          ),
        ).rejects.toThrow(InvalidCredentialsException);
      });

      it('should reject wrong password', async () => {
        await registerTestUser('+919876543210', 'CorrectPass123');

        await expect(
          authService.login(
            {
              phoneNumber: '+919876543210',
              password: 'WrongPass123',
            },
            correlationId,
          ),
        ).rejects.toThrow(InvalidCredentialsException);
      });

      it('should not reveal whether phone exists in error', async () => {
        // Error for non-existent user
        let nonExistentError: Error | null = null;
        try {
          await authService.login(
            {
              phoneNumber: '+919999999999',
              password: 'SomePassword1',
            },
            correlationId,
          );
        } catch (e) {
          nonExistentError = e as Error;
        }

        // Error for wrong password
        await registerTestUser('+919876543210', 'CorrectPass123');
        let wrongPasswordError: Error | null = null;
        try {
          await authService.login(
            {
              phoneNumber: '+919876543210',
              password: 'WrongPass123',
            },
            correlationId,
          );
        } catch (e) {
          wrongPasswordError = e as Error;
        }

        // Both should throw the same error type (prevent enumeration)
        expect(nonExistentError).toBeInstanceOf(InvalidCredentialsException);
        expect(wrongPasswordError).toBeInstanceOf(InvalidCredentialsException);
        expect(nonExistentError?.message).toBe(wrongPasswordError?.message);
      });
    });

    describe('response safety', () => {
      it('should not include password in response', async () => {
        const { phoneNumber, password } = await registerTestUser();

        const result = await authService.login({ phoneNumber, password }, correlationId);

        // Response should not contain password
        expect((result as unknown as Record<string, unknown>).password).toBeUndefined();
        expect(
          (result.user as unknown as Record<string, unknown>).password,
        ).toBeUndefined();
        expect(
          (result.user as unknown as Record<string, unknown>).passwordHash,
        ).toBeUndefined();
      });
    });
  });

  describe('refreshToken', () => {
    const correlationId = 'test-correlation-id';

    // Helper to register and login a user
    async function loginTestUser(
      phoneNumber = '+919876543210',
      password = 'SecurePass123',
    ) {
      await authService.registerUser({ phoneNumber, password }, correlationId);
      return authService.login({ phoneNumber, password }, correlationId);
    }

    describe('successful refresh', () => {
      it('should return new access token and refresh token', async () => {
        const loginResult = await loginTestUser();

        const result = await authService.refreshToken(
          { refreshToken: loginResult.refreshToken },
          correlationId,
        );

        expect(result).toBeDefined();
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(result.tokenType).toBe('Bearer');
        expect(result.expiresIn).toBeGreaterThan(0);
      });

      it('should return a different refresh token (rotation)', async () => {
        const loginResult = await loginTestUser();
        const originalRefreshToken = loginResult.refreshToken;

        const result = await authService.refreshToken(
          { refreshToken: originalRefreshToken },
          correlationId,
        );

        // New refresh token should be different
        expect(result.refreshToken).not.toBe(originalRefreshToken);
      });

      it('should return valid JWT access token', async () => {
        const loginResult = await loginTestUser();

        const result = await authService.refreshToken(
          { refreshToken: loginResult.refreshToken },
          correlationId,
        );

        // Verify the access token is valid
        const payload = jwtService.verify(result.accessToken, {
          secret: TEST_JWT_SECRET,
        });

        expect(payload.sub).toBeDefined();
        expect(payload.phone).toBe('+919876543210');
        expect(payload.type).toBe('access');
      });

      it('should revoke the old refresh token after use', async () => {
        const loginResult = await loginTestUser();
        const originalRefreshToken = loginResult.refreshToken;

        // Use the refresh token
        await authService.refreshToken(
          { refreshToken: originalRefreshToken },
          correlationId,
        );

        // Old token should be revoked
        const oldToken = await refreshTokenRepository.findByToken(originalRefreshToken);
        expect(oldToken).toBeDefined();
        expect(oldToken!.revokedAt).not.toBeNull();
      });

      it('should persist new refresh token in repository', async () => {
        const loginResult = await loginTestUser();

        const result = await authService.refreshToken(
          { refreshToken: loginResult.refreshToken },
          correlationId,
        );

        // New token should be in repository
        const newToken = await refreshTokenRepository.findByToken(result.refreshToken);
        expect(newToken).toBeDefined();
        expect(newToken!.revokedAt).toBeNull();
      });
    });

    describe('token rotation enforcement', () => {
      it('should reject reuse of already-used refresh token', async () => {
        const loginResult = await loginTestUser();
        const originalRefreshToken = loginResult.refreshToken;

        // First use should succeed
        await authService.refreshToken(
          { refreshToken: originalRefreshToken },
          correlationId,
        );

        // Second use should fail (token was revoked)
        await expect(
          authService.refreshToken(
            { refreshToken: originalRefreshToken },
            correlationId,
          ),
        ).rejects.toThrow(RefreshTokenRevokedException);
      });

      it('should allow chained refresh token usage', async () => {
        const loginResult = await loginTestUser();

        // First refresh
        const firstRefresh = await authService.refreshToken(
          { refreshToken: loginResult.refreshToken },
          correlationId,
        );

        // Second refresh with new token
        const secondRefresh = await authService.refreshToken(
          { refreshToken: firstRefresh.refreshToken },
          correlationId,
        );

        expect(secondRefresh.accessToken).toBeDefined();
        expect(secondRefresh.refreshToken).toBeDefined();
        // All three tokens should be different
        expect(secondRefresh.refreshToken).not.toBe(firstRefresh.refreshToken);
        expect(secondRefresh.refreshToken).not.toBe(loginResult.refreshToken);
      });
    });

    describe('invalid token handling', () => {
      it('should reject non-existent refresh token', async () => {
        await expect(
          authService.refreshToken(
            { refreshToken: 'non-existent-token-12345' },
            correlationId,
          ),
        ).rejects.toThrow(InvalidRefreshTokenException);
      });

      it('should reject empty refresh token', async () => {
        await expect(
          authService.refreshToken({ refreshToken: '' }, correlationId),
        ).rejects.toThrow(InvalidRefreshTokenException);
      });

      it('should reject expired refresh token', async () => {
        const loginResult = await loginTestUser();

        // Manually expire the token
        const token = await refreshTokenRepository.findByToken(loginResult.refreshToken);
        if (token) {
          // Create expired version by directly manipulating repository
          // This simulates a token that has naturally expired
          const expiredToken = {
            ...token,
            expiresAt: new Date(Date.now() - 1000), // 1 second ago
          };
          // Access private map for testing (in real tests, we might use time manipulation)
          (refreshTokenRepository as any).tokensByValue.set(
            loginResult.refreshToken,
            expiredToken,
          );
        }

        await expect(
          authService.refreshToken(
            { refreshToken: loginResult.refreshToken },
            correlationId,
          ),
        ).rejects.toThrow(RefreshTokenExpiredException);
      });
    });

    describe('security', () => {
      it('should not expose internal token details in response', async () => {
        const loginResult = await loginTestUser();

        const result = await authService.refreshToken(
          { refreshToken: loginResult.refreshToken },
          correlationId,
        );

        // Response should only contain expected fields
        const resultKeys = Object.keys(result);
        expect(resultKeys).toEqual(
          expect.arrayContaining(['accessToken', 'refreshToken', 'tokenType', 'expiresIn']),
        );
        expect(resultKeys).not.toContain('userId');
        expect(resultKeys).not.toContain('expiresAt');
        expect(resultKeys).not.toContain('revokedAt');
        expect(resultKeys).not.toContain('id');
      });

      it('should generate cryptographically random tokens', async () => {
        // Login twice to get two different tokens
        await authService.registerUser(
          { phoneNumber: '+919876543210', password: 'SecurePass123' },
          correlationId,
        );

        const login1 = await authService.login(
          { phoneNumber: '+919876543210', password: 'SecurePass123' },
          correlationId,
        );

        const login2 = await authService.login(
          { phoneNumber: '+919876543210', password: 'SecurePass123' },
          correlationId,
        );

        // Each login should produce a unique refresh token
        expect(login1.refreshToken).not.toBe(login2.refreshToken);
        // Tokens should have reasonable length (base64url encoded 32 bytes = 43 chars)
        expect(login1.refreshToken.length).toBeGreaterThanOrEqual(40);
        expect(login2.refreshToken.length).toBeGreaterThanOrEqual(40);
      });
    });

    describe('multi-device support', () => {
      it('should allow multiple active refresh tokens per user', async () => {
        await authService.registerUser(
          { phoneNumber: '+919876543210', password: 'SecurePass123' },
          correlationId,
        );

        // Simulate logins from multiple devices
        const login1 = await authService.login(
          { phoneNumber: '+919876543210', password: 'SecurePass123' },
          correlationId,
        );

        const login2 = await authService.login(
          { phoneNumber: '+919876543210', password: 'SecurePass123' },
          correlationId,
        );

        // Both tokens should be valid
        const token1Valid = await refreshTokenRepository.isValid(login1.refreshToken);
        const token2Valid = await refreshTokenRepository.isValid(login2.refreshToken);

        expect(token1Valid).toBe(true);
        expect(token2Valid).toBe(true);

        // Both should be usable
        const refresh1 = await authService.refreshToken(
          { refreshToken: login1.refreshToken },
          correlationId,
        );
        const refresh2 = await authService.refreshToken(
          { refreshToken: login2.refreshToken },
          correlationId,
        );

        expect(refresh1.accessToken).toBeDefined();
        expect(refresh2.accessToken).toBeDefined();
      });
    });
  });

  describe('revokeAllUserTokens', () => {
    const correlationId = 'test-correlation-id';

    it('should revoke all refresh tokens for a user', async () => {
      await authService.registerUser(
        { phoneNumber: '+919876543210', password: 'SecurePass123' },
        correlationId,
      );

      // Create multiple sessions
      const login1 = await authService.login(
        { phoneNumber: '+919876543210', password: 'SecurePass123' },
        correlationId,
      );

      const login2 = await authService.login(
        { phoneNumber: '+919876543210', password: 'SecurePass123' },
        correlationId,
      );

      // Get user ID from token
      const token = await refreshTokenRepository.findByToken(login1.refreshToken);
      const userId = token!.userId;

      // Revoke all tokens
      const revokedCount = await authService.revokeAllUserTokens(userId, correlationId);

      expect(revokedCount).toBe(2);

      // Both tokens should now be invalid
      await expect(
        authService.refreshToken({ refreshToken: login1.refreshToken }, correlationId),
      ).rejects.toThrow(RefreshTokenRevokedException);

      await expect(
        authService.refreshToken({ refreshToken: login2.refreshToken }, correlationId),
      ).rejects.toThrow(RefreshTokenRevokedException);
    });
  });
});
