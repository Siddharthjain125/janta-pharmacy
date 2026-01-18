import { InMemoryUserRepository } from '../repositories/in-memory-user.repository';
import { InMemoryAddressRepository } from '../../address/repositories/in-memory-address.repository';
import { GetMyUserContextUseCase } from './get-my-user-context.use-case';
import { UserNotFoundException } from '../exceptions';

describe('GetMyUserContextUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let addressRepository: InMemoryAddressRepository;
  let useCase: GetMyUserContextUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    addressRepository = new InMemoryAddressRepository();
    useCase = new GetMyUserContextUseCase(userRepository, addressRepository);
  });

  afterEach(() => {
    userRepository.clear();
    addressRepository.clear();
  });

  it('should return profile and addresses for authenticated user', async () => {
    const user = await userRepository.create({
      phoneNumber: '+919876543210',
      name: 'Context User',
    });

    const address = await addressRepository.create({
      userId: user.id,
      label: 'Home',
      line1: '123 Main St',
      city: 'Mumbai',
      state: 'MH',
      postalCode: '400001',
      country: 'India',
      isDefault: true,
    });

    const context = await useCase.execute(user.id);

    expect(context.user.id).toBe(user.id);
    expect(context.addresses).toHaveLength(1);
    expect(context.addresses[0].id).toBe(address.id);
  });

  it('should throw when user is not found', async () => {
    await expect(useCase.execute('missing-user')).rejects.toThrow(UserNotFoundException);
  });
});
