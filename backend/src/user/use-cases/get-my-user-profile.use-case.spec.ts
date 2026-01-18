import { InMemoryUserRepository } from '../repositories/in-memory-user.repository';
import { GetMyUserProfileUseCase } from './get-my-user-profile.use-case';
import { UserNotFoundException } from '../exceptions';

describe('GetMyUserProfileUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let useCase: GetMyUserProfileUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    useCase = new GetMyUserProfileUseCase(userRepository);
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

    const profile = await useCase.execute(user.id);

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
    await expect(useCase.execute('missing-user-id')).rejects.toThrow(UserNotFoundException);
  });
});
