import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IUserRepository } from './user-repository.interface';
import {
  User,
  CreateUserData,
  UpdateUserData,
  normalizePhoneNumber,
} from '../domain';
import { UserRole } from '../domain/user-role';
import { UserStatus } from '../domain/user-status';
import {
  User as PrismaUser,
  UserRole as PrismaUserRole,
  UserStatus as PrismaUserStatus,
} from '@prisma/client';

/**
 * Prisma User Repository
 *
 * Production implementation using PostgreSQL via Prisma.
 * Requires DATABASE_URL to be configured.
 *
 * Features:
 * - Full CRUD operations for users
 * - Phone number and email uniqueness enforcement
 * - Role persistence
 * - Status management
 */
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData): Promise<User> {
    const normalizedPhone = normalizePhoneNumber(data.phoneNumber);

    const user = await this.prisma.user.create({
      data: {
        phoneNumber: normalizedPhone,
        name: data.name ?? null,
        email: data.email ?? null,
        role: this.toPrismaRole(data.roles?.[0] ?? UserRole.CUSTOMER),
        status: PrismaUserStatus.ACTIVE,
      },
    });

    return this.toDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toDomain(user) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return user ? this.toDomain(user) : null;
  }

  async phoneNumberExists(phoneNumber: string): Promise<boolean> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const count = await this.prisma.user.count({
      where: { phoneNumber: normalizedPhone },
    });

    return count > 0;
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.toLowerCase() },
    });

    return count > 0;
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.email !== undefined && {
            email: data.email?.toLowerCase() ?? null,
          }),
          ...(data.roles !== undefined && {
            role: this.toPrismaRole(data.roles[0] ?? UserRole.CUSTOMER),
          }),
          ...(data.status !== undefined && {
            status: this.toPrismaStatus(data.status),
          }),
        },
      });

      return this.toDomain(user);
    } catch (error) {
      // Record not found
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      skip: options?.offset ?? 0,
      take: options?.limit ?? 100,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.toDomain(user));
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false;
      }
      throw error;
    }
  }

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  /**
   * Convert Prisma user to domain User
   */
  private toDomain(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      phoneNumber: prismaUser.phoneNumber,
      email: prismaUser.email,
      name: prismaUser.name,
      roles: [this.toDomainRole(prismaUser.role)],
      status: this.toDomainStatus(prismaUser.status),
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }

  /**
   * Convert domain UserRole to Prisma enum
   */
  private toPrismaRole(role: UserRole): PrismaUserRole {
    const mapping: Record<UserRole, PrismaUserRole> = {
      [UserRole.CUSTOMER]: PrismaUserRole.CUSTOMER,
      [UserRole.STAFF]: PrismaUserRole.STAFF,
      [UserRole.PHARMACIST]: PrismaUserRole.PHARMACIST,
      [UserRole.ADMIN]: PrismaUserRole.ADMIN,
    };
    return mapping[role];
  }

  /**
   * Convert Prisma UserRole to domain enum
   */
  private toDomainRole(role: PrismaUserRole): UserRole {
    const mapping: Record<PrismaUserRole, UserRole> = {
      [PrismaUserRole.CUSTOMER]: UserRole.CUSTOMER,
      [PrismaUserRole.STAFF]: UserRole.STAFF,
      [PrismaUserRole.PHARMACIST]: UserRole.PHARMACIST,
      [PrismaUserRole.ADMIN]: UserRole.ADMIN,
    };
    return mapping[role];
  }

  /**
   * Convert domain UserStatus to Prisma enum
   */
  private toPrismaStatus(status: UserStatus): PrismaUserStatus {
    const mapping: Record<UserStatus, PrismaUserStatus> = {
      [UserStatus.PENDING]: PrismaUserStatus.PENDING,
      [UserStatus.ACTIVE]: PrismaUserStatus.ACTIVE,
      [UserStatus.SUSPENDED]: PrismaUserStatus.SUSPENDED,
      [UserStatus.DEACTIVATED]: PrismaUserStatus.DEACTIVATED,
    };
    return mapping[status];
  }

  /**
   * Convert Prisma UserStatus to domain enum
   */
  private toDomainStatus(status: PrismaUserStatus): UserStatus {
    const mapping: Record<PrismaUserStatus, UserStatus> = {
      [PrismaUserStatus.PENDING]: UserStatus.PENDING,
      [PrismaUserStatus.ACTIVE]: UserStatus.ACTIVE,
      [PrismaUserStatus.SUSPENDED]: UserStatus.SUSPENDED,
      [PrismaUserStatus.DEACTIVATED]: UserStatus.DEACTIVATED,
    };
    return mapping[status];
  }

  /**
   * Check if error is a Prisma "record not found" error
   */
  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    );
  }
}

