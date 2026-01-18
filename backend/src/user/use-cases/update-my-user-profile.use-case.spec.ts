import { BadRequestException } from '@nestjs/common';
import { InMemoryUserRepository } from '../repositories/in-memory-user.repository';
import { UpdateMyUserProfileUseCase } from './update-my-user-profile.use-case';
import {
  InvalidPhoneNumberException,
  PhoneNumberAlreadyExistsException,
  UserNotFoundException,
} from '../exceptions';

describe('UpdateMyUserProfileUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let useCase: UpdateMyUserProfileUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    useCase = new UpdateMyUserProfileUseCase(userRepository);
  });

  afterEach(() => {
    userRepository.clear();
  });

  it('should update allowed fields for the authenticated user', async () => {
    const user = await userRepository.create({
      phoneNumber: '+919876543210',
      email: 'user@example.com',
      name: 'Original User',
    });

    const updated = await useCase.execute(user.id, { name: 'Updated User' });

    expect(updated.name).toBe('Updated User');

    const persisted = await userRepository.findById(user.id);
    expect(persisted?.name).toBe('Updated User');
  });

  it('should update phone number when provided', async () => {
    const user = await userRepository.create({
      phoneNumber: '+919876543210',
      email: 'user@example.com',
      name: 'Profile User',
    });

    const updated = await useCase.execute(user.id, { phoneNumber: '+919876543211' });

    expect(updated.phoneNumber).toBe('+919876543211');

    const persisted = await userRepository.findById(user.id);
    expect(persisted?.phoneNumber).toBe('+919876543211');
  });

  it('should reject duplicate phone numbers', async () => {
    await userRepository.create({
      phoneNumber: '+919876543210',
      email: 'user1@example.com',
      name: 'User One',
    });
    const user2 = await userRepository.create({
      phoneNumber: '+919876543211',
      email: 'user2@example.com',
      name: 'User Two',
    });

    await expect(useCase.execute(user2.id, { phoneNumber: '+919876543210' })).rejects.toThrow(
      PhoneNumberAlreadyExistsException,
    );
  });

  it('should reject invalid phone numbers', async () => {
    const user = await userRepository.create({
      phoneNumber: '+919876543210',
      email: 'user@example.com',
      name: 'Profile User',
    });

    await expect(useCase.execute(user.id, { phoneNumber: '123' })).rejects.toThrow(
      InvalidPhoneNumberException,
    );
  });

  it('should reject empty payloads', async () => {
    const user = await userRepository.create({
      phoneNumber: '+919876543210',
      email: 'user@example.com',
      name: 'Profile User',
    });

    await expect(useCase.execute(user.id, {})).rejects.toThrow(BadRequestException);
  });

  it('should throw when user is not found', async () => {
    await expect(useCase.execute('missing-user-id', { name: 'Updated User' })).rejects.toThrow(
      UserNotFoundException,
    );
  });
});
