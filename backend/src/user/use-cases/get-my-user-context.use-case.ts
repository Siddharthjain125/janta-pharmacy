import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from '../repositories';
import { ADDRESS_REPOSITORY, IAddressRepository } from '../../address/repositories';
import { UserContextDto, toUserProfileDto } from '../dto';
import { toAddressDto } from '../../address/dto';
import { UserNotFoundException } from '../exceptions';

/**
 * GetMyUserContextUseCase
 *
 * Read-only composition for demo purposes.
 * Aggregates user profile + addresses without mutating any data.
 */
@Injectable()
export class GetMyUserContextUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(userId: string): Promise<UserContextDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId, 'id');
    }

    const addresses = await this.addressRepository.findByUserId(userId);

    return {
      user: toUserProfileDto(user),
      addresses: addresses.map((address) => toAddressDto(address)),
    };
  }
}
