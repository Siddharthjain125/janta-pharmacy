import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ADDRESS_REPOSITORY, IAddressRepository } from '../repositories';
import { AddressDto, UpdateAddressDto, toAddressDto } from '../dto';
import {
  AddressNotFoundException,
  UnauthorizedAddressAccessException,
  InvalidDefaultAddressUpdateException,
} from '../exceptions';
import { UpdateAddressData } from '../domain';

/**
 * UpdateAddressUseCase
 *
 * Updates an existing address owned by the authenticated user.
 */
@Injectable()
export class UpdateAddressUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(userId: string, addressId: string, dto: UpdateAddressDto): Promise<AddressDto> {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('Empty address update is not allowed');
    }

    const address = await this.addressRepository.findById(addressId);
    if (!address) {
      throw new AddressNotFoundException(addressId);
    }

    if (address.userId !== userId) {
      throw new UnauthorizedAddressAccessException();
    }

    if (dto.isDefault === false && address.isDefault) {
      throw new InvalidDefaultAddressUpdateException(
        'Cannot unset the default address. Set another address as default first.',
      );
    }

    if (dto.isDefault === true) {
      await this.addressRepository.clearDefaultForUser(userId, addressId);
    }

    const updateData: UpdateAddressData = {
      ...(dto.label !== undefined && { label: dto.label }),
      ...(dto.line1 !== undefined && { line1: dto.line1 }),
      ...(dto.line2 !== undefined && { line2: dto.line2 }),
      ...(dto.city !== undefined && { city: dto.city }),
      ...(dto.state !== undefined && { state: dto.state }),
      ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
      ...(dto.country !== undefined && { country: dto.country }),
      ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
    };

    const updated = await this.addressRepository.update(addressId, updateData);
    if (!updated) {
      throw new AddressNotFoundException(addressId);
    }

    return toAddressDto(updated);
  }
}
