import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Address, CreateAddressData, UpdateAddressData, createAddress } from '../domain';
import { IAddressRepository } from './address-repository.interface';

/**
 * In-Memory Address Repository
 *
 * Development/test implementation using in-memory storage.
 */
@Injectable()
export class InMemoryAddressRepository implements IAddressRepository {
  private readonly addresses: Map<string, Address> = new Map();

  async findById(id: string): Promise<Address | null> {
    return this.addresses.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Address[]> {
    return Array.from(this.addresses.values())
      .filter((address) => address.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async countByUserId(userId: string): Promise<number> {
    let count = 0;
    for (const address of this.addresses.values()) {
      if (address.userId === userId) {
        count += 1;
      }
    }
    return count;
  }

  async findDefaultByUserId(userId: string): Promise<Address | null> {
    for (const address of this.addresses.values()) {
      if (address.userId === userId && address.isDefault) {
        return address;
      }
    }
    return null;
  }

  async findOldestByUserId(userId: string): Promise<Address | null> {
    const addresses = await this.findByUserId(userId);
    return addresses[0] ?? null;
  }

  async create(data: CreateAddressData): Promise<Address> {
    const id = randomUUID();
    const address = createAddress(id, data);
    this.addresses.set(id, address);
    return address;
  }

  async update(id: string, data: UpdateAddressData): Promise<Address | null> {
    const existing = this.addresses.get(id);
    if (!existing) return null;

    const updated: Address = {
      ...existing,
      label: data.label ?? existing.label,
      line1: data.line1 ?? existing.line1,
      line2: data.line2 !== undefined ? data.line2 : existing.line2,
      city: data.city ?? existing.city,
      state: data.state ?? existing.state,
      postalCode: data.postalCode ?? existing.postalCode,
      country: data.country ?? existing.country,
      isDefault: data.isDefault ?? existing.isDefault,
      updatedAt: new Date(),
    };

    this.addresses.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.addresses.has(id)) {
      return false;
    }
    this.addresses.delete(id);
    return true;
  }

  async clearDefaultForUser(userId: string, exceptId?: string): Promise<void> {
    for (const [id, address] of this.addresses.entries()) {
      if (address.userId !== userId) continue;
      if (exceptId && id === exceptId) continue;
      if (!address.isDefault) continue;

      this.addresses.set(id, {
        ...address,
        isDefault: false,
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Clear all data (useful for testing)
   */
  clear(): void {
    this.addresses.clear();
  }
}
