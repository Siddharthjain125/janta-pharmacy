import { User, CreateUserData, UpdateUserData } from '../domain';

/**
 * Injection token for the User repository
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

/**
 * User Repository Interface
 *
 * Defines the contract for user data access.
 * Implementations can be in-memory, Prisma, or any other storage.
 *
 * Design notes:
 * - All methods are async for consistency
 * - Returns User entities, not database models
 * - Uniqueness enforcement is repository responsibility
 */
export interface IUserRepository {
  /**
   * Create a new user
   * @throws if phone number already exists (implementation should check)
   */
  create(data: CreateUserData): Promise<User>;

  /**
   * Find user by ID
   * @returns User or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by phone number
   * @returns User or null if not found
   */
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;

  /**
   * Find user by email
   * @returns User or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Check if phone number exists
   */
  phoneNumberExists(phoneNumber: string): Promise<boolean>;

  /**
   * Check if email exists
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Update user by ID
   * @returns Updated user or null if not found
   */
  update(id: string, data: UpdateUserData): Promise<User | null>;

  /**
   * Find all users with optional pagination
   */
  findAll(options?: { limit?: number; offset?: number }): Promise<User[]>;

  /**
   * Count total users
   */
  count(): Promise<number>;

  /**
   * Delete user by ID (soft delete preferred in production)
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
}
