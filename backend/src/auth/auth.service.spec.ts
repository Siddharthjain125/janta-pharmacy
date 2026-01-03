import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PASSWORD_HASHER } from './interfaces/password-hasher.interface';
import { BcryptPasswordHasher } from './infrastructure/bcrypt-password-hasher';
import { CREDENTIAL_REPOSITORY } from './credentials/credential-repository.interface';
import { InMemoryCredentialRepository } from './credentials/in-memory-credential.repository';
import { USER_REPOSITORY } from '../user/repositories/user-repository.interface';
import { InMemoryUserRepository } from '../user/repositories/in-memory-user.repository';
import {
  PhoneNumberAlreadyRegisteredException,
  InvalidPhoneNumberFormatException,
  WeakPasswordException,
} from './exceptions';

/**
 * AuthService Tests
 *
 * These tests validate the behavior of the user registration flow.
 * They use real implementations (not mocks) to ensure realistic behavior.
 *
 * Design decisions:
 * - Real InMemoryUserRepository (fast, no DB)
 * - Real BcryptPasswordHasher (validates actual hashing)
 * - Real InMemoryCredentialRepository (validates credential storage)
 * - Focus on observable behavior, not implementation details
 */
describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: InMemoryUserRepository;
  let credentialRepository: InMemoryCredentialRepository;
  let passwordHasher: BcryptPasswordHasher;

  beforeEach(async () => {
    // Create fresh instances for each test
    userRepository = new InMemoryUserRepository();
    credentialRepository = new InMemoryCredentialRepository();
    passwordHasher = new BcryptPasswordHasher();

    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    // Clean up between tests
    userRepository.clear();
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
});

