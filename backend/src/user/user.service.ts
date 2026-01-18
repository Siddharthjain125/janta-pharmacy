import { Injectable, Inject } from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from './repositories';
import {
  User,
  isValidPhoneNumber,
  normalizePhoneNumber,
  canAuthenticate,
  UserStatus,
} from './domain';
import { CreateUserDto, UpdateUserDto, UserDto, toUserDto } from './dto';
import {
  UserNotFoundException,
  PhoneNumberAlreadyExistsException,
  EmailAlreadyExistsException,
  InvalidPhoneNumberException,
  InvalidUserStatusException,
} from './exceptions';
import { logWithCorrelation } from '../common/logging/logger';

/**
 * User Service
 *
 * Business logic for user identity management.
 * This service handles user creation and lookup,
 * but NOT authentication (that's a separate concern).
 *
 * Design decisions:
 * - Validates phone number format
 * - Enforces uniqueness via repository
 * - Returns DTOs, not domain entities (for API safety)
 * - Logs significant operations
 */
@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Create a new user identity
   */
  async createUser(dto: CreateUserDto, correlationId: string): Promise<UserDto> {
    // Validate phone number format
    if (!isValidPhoneNumber(dto.phoneNumber)) {
      throw new InvalidPhoneNumberException();
    }

    const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);

    // Check if phone number already exists
    const phoneExists = await this.userRepository.phoneNumberExists(normalizedPhone);
    if (phoneExists) {
      throw new PhoneNumberAlreadyExistsException(normalizedPhone);
    }

    // Check if email already exists (if provided)
    if (dto.email) {
      const emailExists = await this.userRepository.emailExists(dto.email);
      if (emailExists) {
        throw new EmailAlreadyExistsException();
      }
    }

    // Create user
    const user = await this.userRepository.create({
      phoneNumber: normalizedPhone,
      email: dto.email,
      name: dto.name,
    });

    logWithCorrelation('INFO', correlationId, 'User created', 'UserService', {
      userId: user.id,
      phoneNumber: normalizedPhone,
    });

    return toUserDto(user);
  }

  /**
   * Find user by ID
   */
  async findById(userId: string, correlationId: string): Promise<UserDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId, 'id');
    }
    return toUserDto(user);
  }

  /**
   * Find user by phone number
   */
  async findByPhoneNumber(phoneNumber: string, correlationId: string): Promise<UserDto> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const user = await this.userRepository.findByPhoneNumber(normalizedPhone);
    if (!user) {
      throw new UserNotFoundException(normalizedPhone, 'phone');
    }
    return toUserDto(user);
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, dto: UpdateUserDto, correlationId: string): Promise<UserDto> {
    const existing = await this.userRepository.findById(userId);
    if (!existing) {
      throw new UserNotFoundException(userId, 'id');
    }

    // Check email uniqueness if changing
    if (dto.email && dto.email !== existing.email) {
      const emailExists = await this.userRepository.emailExists(dto.email);
      if (emailExists) {
        throw new EmailAlreadyExistsException();
      }
    }

    const updated = await this.userRepository.update(userId, {
      email: dto.email,
      name: dto.name,
    });

    if (!updated) {
      throw new UserNotFoundException(userId, 'id');
    }

    logWithCorrelation('INFO', correlationId, 'User updated', 'UserService', { userId });

    return toUserDto(updated);
  }

  /**
   * List all users (admin operation)
   */
  async listUsers(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ users: UserDto[]; total: number }> {
    const offset = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userRepository.findAll({ limit, offset }),
      this.userRepository.count(),
    ]);

    return {
      users: users.map(toUserDto),
      total,
    };
  }

  /**
   * Check if user can authenticate
   * Used by auth module to validate user state
   */
  async canUserAuthenticate(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;
    return canAuthenticate(user.status);
  }

  /**
   * Get raw user entity (for internal use by auth module)
   * @internal
   */
  async getUserEntity(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  /**
   * Get user by phone number (internal)
   * @internal
   */
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    return this.userRepository.findByPhoneNumber(normalizedPhone);
  }

  /**
   * Update user status (admin operation)
   */
  async updateUserStatus(
    userId: string,
    status: UserStatus,
    correlationId: string,
  ): Promise<UserDto> {
    const existing = await this.userRepository.findById(userId);
    if (!existing) {
      throw new UserNotFoundException(userId, 'id');
    }

    const updated = await this.userRepository.update(userId, { status });
    if (!updated) {
      throw new UserNotFoundException(userId, 'id');
    }

    logWithCorrelation(
      'INFO',
      correlationId,
      `User status changed: ${existing.status} → ${status}`,
      'UserService',
      { userId, previousStatus: existing.status, newStatus: status },
    );

    return toUserDto(updated);
  }
}
