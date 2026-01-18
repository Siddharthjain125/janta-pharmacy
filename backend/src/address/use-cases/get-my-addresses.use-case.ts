import { Inject, Injectable } from '@nestjs/common';
import { ADDRESS_REPOSITORY, IAddressRepository } from '../repositories';
import { AddressDto, toAddressDto } from '../dto';

/**
 * GetMyAddressesUseCase
 *
 * Read-only use case for retrieving the authenticated user's addresses.
 */
@Injectable()
export class GetMyAddressesUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(userId: string): Promise<AddressDto[]> {
    const addresses = await this.addressRepository.findByUserId(userId);
    return addresses.map((address) => toAddressDto(address));
  }
}
