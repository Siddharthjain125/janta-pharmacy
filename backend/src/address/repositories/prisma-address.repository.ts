import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Address, CreateAddressData, UpdateAddressData } from '../domain';
import { IAddressRepository } from './address-repository.interface';

type PrismaAddressRecord = {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaAddressClient = {
  findUnique(args: { where: { id: string } }): Promise<PrismaAddressRecord | null>;
  findMany(args: {
    where: { userId: string };
    orderBy: { createdAt: 'asc' | 'desc' };
  }): Promise<PrismaAddressRecord[]>;
  count(args: { where: { userId: string } }): Promise<number>;
  findFirst(args: {
    where: { userId: string; isDefault?: boolean };
    orderBy: { createdAt: 'asc' | 'desc' };
  }): Promise<PrismaAddressRecord | null>;
  create(args: {
    data: {
      userId: string;
      label: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
    };
  }): Promise<PrismaAddressRecord>;
  update(args: {
    where: { id: string };
    data: Partial<Omit<PrismaAddressRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
  }): Promise<PrismaAddressRecord>;
  delete(args: { where: { id: string } }): Promise<PrismaAddressRecord>;
  updateMany(args: {
    where: { userId: string; isDefault: boolean; NOT?: { id: string } };
    data: { isDefault: boolean };
  }): Promise<{ count: number }>;
};

/**
 * Prisma Address Repository
 *
 * Production implementation using PostgreSQL via Prisma.
 */
@Injectable()
export class PrismaAddressRepository implements IAddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Address | null> {
    const address = await this.addressClient.findUnique({ where: { id } });
    return address ? this.toDomain(address) : null;
  }

  async findByUserId(userId: string): Promise<Address[]> {
    const addresses = await this.addressClient.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return addresses.map((address) => this.toDomain(address));
  }

  async countByUserId(userId: string): Promise<number> {
    return this.addressClient.count({ where: { userId } });
  }

  async findDefaultByUserId(userId: string): Promise<Address | null> {
    const address = await this.addressClient.findFirst({
      where: { userId, isDefault: true },
      orderBy: { createdAt: 'asc' },
    });
    return address ? this.toDomain(address) : null;
  }

  async findOldestByUserId(userId: string): Promise<Address | null> {
    const address = await this.addressClient.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return address ? this.toDomain(address) : null;
  }

  async create(data: CreateAddressData): Promise<Address> {
    const address = await this.addressClient.create({
      data: {
        userId: data.userId,
        label: data.label,
        line1: data.line1,
        line2: data.line2 ?? null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault ?? false,
      },
    });

    return this.toDomain(address);
  }

  async update(id: string, data: UpdateAddressData): Promise<Address | null> {
    try {
      const address = await this.addressClient.update({
        where: { id },
        data: {
          ...(data.label !== undefined && { label: data.label }),
          ...(data.line1 !== undefined && { line1: data.line1 }),
          ...(data.line2 !== undefined && { line2: data.line2 }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.state !== undefined && { state: data.state }),
          ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
          ...(data.country !== undefined && { country: data.country }),
          ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        },
      });
      return this.toDomain(address);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.addressClient.delete({ where: { id } });
      return true;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false;
      }
      throw error;
    }
  }

  async clearDefaultForUser(userId: string, exceptId?: string): Promise<void> {
    await this.addressClient.updateMany({
      where: {
        userId,
        isDefault: true,
        ...(exceptId && { NOT: { id: exceptId } }),
      },
      data: { isDefault: false },
    });
  }

  private get addressClient(): PrismaAddressClient {
    return (this.prisma as PrismaService & { address: PrismaAddressClient }).address;
  }

  private toDomain(prismaAddress: PrismaAddressRecord): Address {
    return {
      id: prismaAddress.id,
      userId: prismaAddress.userId,
      label: prismaAddress.label,
      line1: prismaAddress.line1,
      line2: prismaAddress.line2,
      city: prismaAddress.city,
      state: prismaAddress.state,
      postalCode: prismaAddress.postalCode,
      country: prismaAddress.country,
      isDefault: prismaAddress.isDefault,
      createdAt: prismaAddress.createdAt,
      updatedAt: prismaAddress.updatedAt,
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
