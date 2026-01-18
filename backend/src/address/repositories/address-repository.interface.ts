import { Address, CreateAddressData, UpdateAddressData } from '../domain';

/**
 * Address Repository Interface
 *
 * Contract for accessing Address aggregates.
 * Implementations: InMemoryAddressRepository, PrismaAddressRepository
 */
export interface IAddressRepository {
  findById(id: string): Promise<Address | null>;
  findByUserId(userId: string): Promise<Address[]>;
  countByUserId(userId: string): Promise<number>;
  findDefaultByUserId(userId: string): Promise<Address | null>;
  findOldestByUserId(userId: string): Promise<Address | null>;
  create(data: CreateAddressData): Promise<Address>;
  update(id: string, data: UpdateAddressData): Promise<Address | null>;
  delete(id: string): Promise<boolean>;
  clearDefaultForUser(userId: string, exceptId?: string): Promise<void>;
}

export const ADDRESS_REPOSITORY = 'ADDRESS_REPOSITORY';
