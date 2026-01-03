import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  Credential,
  CreateCredentialData,
  CredentialType,
} from './credential.entity';
import { ICredentialRepository } from './credential-repository.interface';

/**
 * In-Memory Credential Repository
 *
 * Temporary implementation for development without a database.
 * Data is lost on application restart.
 *
 * Production notes:
 * - Replace with PrismaCredentialRepository when DB is ready
 * - Credentials should be stored with appropriate security
 */
@Injectable()
export class InMemoryCredentialRepository implements ICredentialRepository {
  private readonly credentials: Map<string, Credential> = new Map();

  async create(data: CreateCredentialData): Promise<Credential> {
    // Check for existing credential of same type
    const existing = await this.findByUserIdAndType(data.userId, data.type);
    if (existing) {
      throw new Error(
        `Credential of type '${data.type}' already exists for user ${data.userId}`,
      );
    }

    const now = new Date();
    const credential: Credential = {
      id: randomUUID(),
      userId: data.userId,
      type: data.type,
      value: data.value,
      createdAt: now,
      updatedAt: now,
    };

    this.credentials.set(credential.id, credential);
    return credential;
  }

  async findByUserIdAndType(
    userId: string,
    type: CredentialType,
  ): Promise<Credential | null> {
    for (const credential of this.credentials.values()) {
      if (credential.userId === userId && credential.type === type) {
        return credential;
      }
    }
    return null;
  }

  async findAllByUserId(userId: string): Promise<Credential[]> {
    const result: Credential[] = [];
    for (const credential of this.credentials.values()) {
      if (credential.userId === userId) {
        result.push(credential);
      }
    }
    return result;
  }

  async update(id: string, value: string | null): Promise<Credential | null> {
    const existing = this.credentials.get(id);
    if (!existing) {
      return null;
    }

    const updated: Credential = {
      ...existing,
      value,
      updatedAt: new Date(),
    };

    this.credentials.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.credentials.delete(id);
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    for (const [id, credential] of this.credentials.entries()) {
      if (credential.userId === userId) {
        this.credentials.delete(id);
      }
    }
  }

  async hasCredential(userId: string, type: CredentialType): Promise<boolean> {
    const credential = await this.findByUserIdAndType(userId, type);
    return credential !== null;
  }
}

