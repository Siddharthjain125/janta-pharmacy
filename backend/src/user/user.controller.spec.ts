import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserProfileDto } from './dto';
import { UserRole } from './domain/user-role';
import { UserStatus } from './domain/user-status';
import { GetMyUserProfileUseCase } from './use-cases/get-my-user-profile.use-case';

describe('UserController - GET /users/me', () => {
  let controller: UserController;
  let getMyUserProfileUseCase: jest.Mocked<GetMyUserProfileUseCase>;

  beforeEach(() => {
    getMyUserProfileUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetMyUserProfileUseCase>;

    controller = new UserController({} as UserService, getMyUserProfileUseCase);
  });

  it('should be protected by JwtAuthGuard', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      UserController.prototype.getCurrentUser,
    ) as unknown[];

    expect(guards).toEqual(expect.arrayContaining([JwtAuthGuard]));
  });

  it('should return the authenticated user profile', async () => {
    const profile: UserProfileDto = {
      id: 'user-id',
      phoneNumber: '+919876543210',
      email: 'user@example.com',
      name: 'Test User',
      roles: [UserRole.CUSTOMER],
      status: UserStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    getMyUserProfileUseCase.execute.mockResolvedValue(profile);

    const result = await controller.getCurrentUser('user-id', 'corr-id');

    expect(getMyUserProfileUseCase.execute).toHaveBeenCalledWith('user-id');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(profile);
    expect(result.message).toBe('Profile retrieved successfully');
    expect(result.timestamp).toEqual(expect.any(String));
  });
});
