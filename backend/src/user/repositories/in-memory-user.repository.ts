import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IUserRepository } from './user-repository.interface';
import {
  User,
  CreateUserData,
  UpdateUserData,
  createUser,
  normalizePhoneNumber,
} from '../domain';

/**
 * In-Memory User Repository
 *
 * Development implementation that stores users in memory.
 * Enforces uniqueness constraints at the repository level.
 *
 * Features:
 * - Thread-safe for single-instance usage
 * - Enforces phone number uniqueness
 * - Enforces email uniqueness (when email is provided)
 * - No persistence across restarts
 */
@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private readonly users: Map<string, User> = new Map();

  // Secondary indexes for efficient lookups
  private readonly phoneIndex: Map<string, string> = new Map(); // phone -> userId
  private readonly emailIndex: Map<string, string> = new Map(); // email -> userId

  async create(data: CreateUserData): Promise<User> {
    const id = randomUUID();
    const normalizedPhone = normalizePhoneNumber(data.phoneNumber);

    // Enforce phone uniqueness
    if (this.phoneIndex.has(normalizedPhone)) {
      throw new Error(`Phone number already exists: ${normalizedPhone}`);
    }

    // Enforce email uniqueness if provided
    if (data.email && this.emailIndex.has(data.email.toLowerCase())) {
      throw new Error(`Email already exists: ${data.email}`);
    }

    const user = createUser(id, {
      ...data,
      phoneNumber: normalizedPhone,
    });

    // Store user
    this.users.set(id, user);

    // Update indexes
    this.phoneIndex.set(normalizedPhone, id);
    if (user.email) {
      this.emailIndex.set(user.email.toLowerCase(), id);
    }

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const userId = this.phoneIndex.get(normalizedPhone);
    if (!userId) return null;
    return this.users.get(userId) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email.toLowerCase());
    if (!userId) return null;
    return this.users.get(userId) ?? null;
  }

  async phoneNumberExists(phoneNumber: string): Promise<boolean> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    return this.phoneIndex.has(normalizedPhone);
  }

  async emailExists(email: string): Promise<boolean> {
    return this.emailIndex.has(email.toLowerCase());
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    const existing = this.users.get(id);
    if (!existing) return null;

    // If email is being changed, check uniqueness
    if (data.email !== undefined && data.email !== existing.email) {
      if (data.email && this.emailIndex.has(data.email.toLowerCase())) {
        const existingUserId = this.emailIndex.get(data.email.toLowerCase());
        if (existingUserId !== id) {
          throw new Error(`Email already exists: ${data.email}`);
        }
      }

      // Remove old email from index
      if (existing.email) {
        this.emailIndex.delete(existing.email.toLowerCase());
      }

      // Add new email to index
      if (data.email) {
        this.emailIndex.set(data.email.toLowerCase(), id);
      }
    }

    const updated: User = {
      ...existing,
      email: data.email !== undefined ? data.email : existing.email,
      name: data.name !== undefined ? data.name : existing.name,
      roles: data.roles !== undefined ? data.roles : existing.roles,
      status: data.status !== undefined ? data.status : existing.status,
      updatedAt: new Date(),
    };

    this.users.set(id, updated);
    return updated;
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? allUsers.length;
    return allUsers.slice(offset, offset + limit);
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  async delete(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    // Remove from indexes
    this.phoneIndex.delete(user.phoneNumber);
    if (user.email) {
      this.emailIndex.delete(user.email.toLowerCase());
    }

    // Remove user
    this.users.delete(id);
    return true;
  }

  /**
   * Clear all data (useful for testing)
   */
  clear(): void {
    this.users.clear();
    this.phoneIndex.clear();
    this.emailIndex.clear();
  }

  /**
   * Get current user count (useful for debugging)
   */
  size(): number {
    return this.users.size;
  }
}

