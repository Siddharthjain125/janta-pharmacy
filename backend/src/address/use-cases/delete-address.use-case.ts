import { Inject, Injectable } from '@nestjs/common';
import { ADDRESS_REPOSITORY, IAddressRepository } from '../repositories';
import { AddressNotFoundException, UnauthorizedAddressAccessException } from '../exceptions';

/**
 * DeleteAddressUseCase
 *
 * Deletes an address owned by the authenticated user.
 *
 * Default Address Rule (Option A):
 * - If the default address is deleted, promote the oldest remaining address.
 */
@Injectable()
export class DeleteAddressUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(userId: string, addressId: string): Promise<void> {
    const address = await this.addressRepository.findById(addressId);
    if (!address) {
      throw new AddressNotFoundException(addressId);
    }

    if (address.userId !== userId) {
      throw new UnauthorizedAddressAccessException();
    }

    const wasDefault = address.isDefault;
    const deleted = await this.addressRepository.delete(addressId);
    if (!deleted) {
      throw new AddressNotFoundException(addressId);
    }

    if (wasDefault) {
      const fallback = await this.addressRepository.findOldestByUserId(userId);
      if (fallback) {
        await this.addressRepository.clearDefaultForUser(userId, fallback.id);
        await this.addressRepository.update(fallback.id, { isDefault: true });
      }
    }
  }
}
