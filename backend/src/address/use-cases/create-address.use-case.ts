import { Inject, Injectable } from '@nestjs/common';
import { ADDRESS_REPOSITORY, IAddressRepository } from '../repositories';
import { AddressDto, CreateAddressDto, toAddressDto } from '../dto';
import { CreateAddressData } from '../domain';

/**
 * CreateAddressUseCase
 *
 * Creates a new address for the authenticated user.
 *
 * Default Address Rule (Option A):
 * - If isDefault is true, unset the previous default address.
 * - If this is the first address, it becomes default regardless of request.
 */
@Injectable()
export class CreateAddressUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(userId: string, dto: CreateAddressDto): Promise<AddressDto> {
    const addressCount = await this.addressRepository.countByUserId(userId);
    const isFirstAddress = addressCount === 0;
    const shouldBeDefault = isFirstAddress || dto.isDefault === true;

    if (shouldBeDefault && !isFirstAddress) {
      await this.addressRepository.clearDefaultForUser(userId);
    }

    const data: CreateAddressData = {
      userId,
      label: dto.label,
      line1: dto.line1,
      line2: dto.line2 ?? null,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      country: dto.country,
      isDefault: shouldBeDefault,
    };

    const created = await this.addressRepository.create(data);
    return toAddressDto(created);
  }
}
