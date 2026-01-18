import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Credential, CreateCredentialData, CredentialType } from './credential.entity';
import { ICredentialRepository } from './credential-repository.interface';

/**
 * Prisma Credential Repository
 *
 * Production implementation using PostgreSQL via Prisma.
 * Note: Current schema stores only password credentials.
 */
@Injectable()
export class PrismaCredentialRepository implements ICredentialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCredentialData): Promise<Credential> {
    if (data.type !== 'password') {
      throw new Error(`Credential type '${data.type}' is not supported in Prisma storage`);
    }
    if (!data.value) {
      throw new Error('Password credential value is required');
    }

    const credential = await this.prisma.credential.create({
      data: {
        userId: data.userId,
        passwordHash: data.value,
      },
    });

    return this.toDomain(credential);
  }

  async findByUserIdAndType(userId: string, type: CredentialType): Promise<Credential | null> {
    if (type !== 'password') {
      return null;
    }

    const credential = await this.prisma.credential.findUnique({
      where: { userId },
    });

    return credential ? this.toDomain(credential) : null;
  }

  async findAllByUserId(userId: string): Promise<Credential[]> {
    const credential = await this.prisma.credential.findUnique({
      where: { userId },
    });
    return credential ? [this.toDomain(credential)] : [];
  }

  async update(id: string, value: string | null): Promise<Credential | null> {
    if (!value) {
      throw new Error('Password credential value is required');
    }

    try {
      const credential = await this.prisma.credential.update({
        where: { id },
        data: { passwordHash: value },
      });
      return this.toDomain(credential);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.credential.delete({ where: { id } });
      return true;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false;
      }
      throw error;
    }
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prisma.credential.deleteMany({ where: { userId } });
  }

  async hasCredential(userId: string, type: CredentialType): Promise<boolean> {
    const credential = await this.findByUserIdAndType(userId, type);
    return credential !== null;
  }

  private toDomain(credential: { id: string; userId: string; passwordHash: string; createdAt: Date; updatedAt: Date }): Credential {
    return {
      id: credential.id,
      userId: credential.userId,
      type: 'password',
      value: credential.passwordHash,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    );
  }
}
