import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from '../repositories';
import { UserProfileDto, toUserProfileDto } from '../dto';
import { UserNotFoundException } from '../exceptions';

/**
 * GetMyUserProfileUseCase
 *
 * Read-only use case for retrieving the authenticated user's profile.
 */
@Injectable()
export class GetMyUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId, 'id');
    }

    return toUserProfileDto(user);
  }
}
