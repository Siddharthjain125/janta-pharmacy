import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserProfileDto } from './dto';
import { UserRole } from './domain/user-role';
import { UserStatus } from './domain/user-status';
import { GetMyUserProfileUseCase } from './use-cases/get-my-user-profile.use-case';
import { UpdateMyUserProfileUseCase } from './use-cases/update-my-user-profile.use-case';

describe('UserController - GET /users/me', () => {
  let controller: UserController;
  let getMyUserProfileUseCase: jest.Mocked<GetMyUserProfileUseCase>;
  let updateMyUserProfileUseCase: jest.Mocked<UpdateMyUserProfileUseCase>;

  beforeEach(() => {
    getMyUserProfileUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetMyUserProfileUseCase>;

    updateMyUserProfileUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateMyUserProfileUseCase>;

    controller = new UserController(
      {} as UserService,
      getMyUserProfileUseCase,
      updateMyUserProfileUseCase,
    );
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

    const result = await controller.getCurrentUser('user-id');

    expect(getMyUserProfileUseCase.execute).toHaveBeenCalledWith('user-id');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(profile);
    expect(result.message).toBe('Profile retrieved successfully');
    expect(result.timestamp).toEqual(expect.any(String));
  });
});

describe('UserController - PATCH /users/me', () => {
  let controller: UserController;
  let updateMyUserProfileUseCase: jest.Mocked<UpdateMyUserProfileUseCase>;

  beforeEach(() => {
    updateMyUserProfileUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateMyUserProfileUseCase>;

    controller = new UserController(
      {} as UserService,
      {} as GetMyUserProfileUseCase,
      updateMyUserProfileUseCase,
    );
  });

  it('should be protected by JwtAuthGuard', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      UserController.prototype.updateCurrentUser,
    ) as unknown[];

    expect(guards).toEqual(expect.arrayContaining([JwtAuthGuard]));
  });

  it('should return the updated profile', async () => {
    const profile: UserProfileDto = {
      id: 'user-id',
      phoneNumber: '+919876543210',
      email: 'user@example.com',
      name: 'Updated User',
      roles: [UserRole.CUSTOMER],
      status: UserStatus.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateMyUserProfileUseCase.execute.mockResolvedValue(profile);

    const result = await controller.updateCurrentUser('user-id', { name: 'Updated User' });

    expect(updateMyUserProfileUseCase.execute).toHaveBeenCalledWith('user-id', {
      name: 'Updated User',
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual(profile);
    expect(result.message).toBe('Profile updated successfully');
    expect(result.timestamp).toEqual(expect.any(String));
  });
});
