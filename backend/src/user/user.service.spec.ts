import { UserService } from './user.service';
import { InMemoryUserRepository } from './repositories/in-memory-user.repository';
import { UserNotFoundException } from './exceptions';

describe('UserService - getSelfProfile', () => {
  let userService: UserService;
  let userRepository: InMemoryUserRepository;

  const correlationId = 'test-correlation-id';

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userService = new UserService(userRepository);
  });

  afterEach(() => {
    userRepository.clear();
  });

  it('should return the authenticated user profile with unmasked phone', async () => {
    const user = await userRepository.create({
      phoneNumber: '+919876543210',
      email: 'user@example.com',
      name: 'Profile User',
    });

    const profile = await userService.getSelfProfile(user.id, correlationId);

    expect(profile).toEqual({
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      name: user.name,
      roles: user.roles,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  });

  it('should throw when user is not found', async () => {
    await expect(
      userService.getSelfProfile('missing-user-id', correlationId),
    ).rejects.toThrow(UserNotFoundException);
  });
});
