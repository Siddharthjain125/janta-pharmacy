import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from '../repositories';
import { UpdateMyUserProfileDto, UserProfileDto, toUserProfileDto } from '../dto';
import {
  InvalidPhoneNumberException,
  PhoneNumberAlreadyExistsException,
  UserNotFoundException,
} from '../exceptions';
import { isValidPhoneNumber, normalizePhoneNumber, UpdateUserData } from '../domain';

/**
 * UpdateMyUserProfileUseCase
 *
 * Applies a controlled, self-service profile update for the authenticated user.
 */
@Injectable()
export class UpdateMyUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, dto: UpdateMyUserProfileDto): Promise<UserProfileDto> {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('Empty profile update is not allowed');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId, 'id');
    }

    const updateData: UpdateUserData = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }

    if (dto.phoneNumber !== undefined) {
      if (!isValidPhoneNumber(dto.phoneNumber)) {
        throw new InvalidPhoneNumberException();
      }

      const normalizedPhone = normalizePhoneNumber(dto.phoneNumber);
      if (normalizedPhone !== user.phoneNumber) {
        const exists = await this.userRepository.phoneNumberExists(normalizedPhone);
        if (exists) {
          throw new PhoneNumberAlreadyExistsException(normalizedPhone);
        }
      }

      updateData.phoneNumber = normalizedPhone;
    }

    const updated = await this.userRepository.update(userId, updateData);
    if (!updated) {
      throw new UserNotFoundException(userId, 'id');
    }

    return toUserProfileDto(updated);
  }
}
