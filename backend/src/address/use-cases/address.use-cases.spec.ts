import { InMemoryAddressRepository } from '../repositories/in-memory-address.repository';
import { CreateAddressUseCase } from './create-address.use-case';
import { GetMyAddressesUseCase } from './get-my-addresses.use-case';
import { UpdateAddressUseCase } from './update-address.use-case';
import { DeleteAddressUseCase } from './delete-address.use-case';
import {
  UnauthorizedAddressAccessException,
  InvalidDefaultAddressUpdateException,
} from '../exceptions';

describe('Address Use Cases', () => {
  let repository: InMemoryAddressRepository;
  let createAddressUseCase: CreateAddressUseCase;
  let getMyAddressesUseCase: GetMyAddressesUseCase;
  let updateAddressUseCase: UpdateAddressUseCase;
  let deleteAddressUseCase: DeleteAddressUseCase;

  beforeEach(() => {
    repository = new InMemoryAddressRepository();
    createAddressUseCase = new CreateAddressUseCase(repository);
    getMyAddressesUseCase = new GetMyAddressesUseCase(repository);
    updateAddressUseCase = new UpdateAddressUseCase(repository);
    deleteAddressUseCase = new DeleteAddressUseCase(repository);
  });

  afterEach(() => {
    repository.clear();
  });

  it('allows a user to create, view, update, and delete their addresses', async () => {
    const userId = 'user-1';

    const created = await createAddressUseCase.execute(userId, {
      label: 'Home',
      line1: '123 Main St',
      city: 'Mumbai',
      state: 'MH',
      postalCode: '400001',
      country: 'India',
    });

    const addresses = await getMyAddressesUseCase.execute(userId);
    expect(addresses).toHaveLength(1);
    expect(addresses[0].id).toBe(created.id);

    const updated = await updateAddressUseCase.execute(userId, created.id, {
      label: 'Primary Home',
    });
    expect(updated.label).toBe('Primary Home');

    await deleteAddressUseCase.execute(userId, created.id);
    const remaining = await getMyAddressesUseCase.execute(userId);
    expect(remaining).toHaveLength(0);
  });

  it('prevents a user from modifying another user’s addresses', async () => {
    const userId = 'user-1';
    const otherUserId = 'user-2';

    const created = await createAddressUseCase.execute(userId, {
      label: 'Office',
      line1: '456 Market Rd',
      city: 'Pune',
      state: 'MH',
      postalCode: '411001',
      country: 'India',
    });

    await expect(
      updateAddressUseCase.execute(otherUserId, created.id, { label: 'Hacked' }),
    ).rejects.toThrow(UnauthorizedAddressAccessException);

    await expect(deleteAddressUseCase.execute(otherUserId, created.id)).rejects.toThrow(
      UnauthorizedAddressAccessException,
    );
  });

  it('preserves a single default address per user', async () => {
    const userId = 'user-1';

    const first = await createAddressUseCase.execute(userId, {
      label: 'Home',
      line1: '12 Residency',
      city: 'Delhi',
      state: 'DL',
      postalCode: '110001',
      country: 'India',
      isDefault: false,
    });

    const second = await createAddressUseCase.execute(userId, {
      label: 'Office',
      line1: '99 Business Park',
      city: 'Delhi',
      state: 'DL',
      postalCode: '110002',
      country: 'India',
      isDefault: true,
    });

    const list = await repository.findByUserId(userId);
    const defaultAddresses = list.filter((address) => address.isDefault);
    expect(defaultAddresses).toHaveLength(1);
    expect(defaultAddresses[0].id).toBe(second.id);

    await updateAddressUseCase.execute(userId, first.id, { isDefault: true });
    const afterUpdate = await repository.findByUserId(userId);
    const defaultsAfterUpdate = afterUpdate.filter((address) => address.isDefault);
    expect(defaultsAfterUpdate).toHaveLength(1);
    expect(defaultsAfterUpdate[0].id).toBe(first.id);
  });

  it('promotes the oldest remaining address when default is deleted', async () => {
    const userId = 'user-1';

    const defaultAddress = await createAddressUseCase.execute(userId, {
      label: 'Home',
      line1: '1 Park Ave',
      city: 'Kolkata',
      state: 'WB',
      postalCode: '700001',
      country: 'India',
      isDefault: true,
    });

    const second = await createAddressUseCase.execute(userId, {
      label: 'Office',
      line1: '2 Work Ave',
      city: 'Kolkata',
      state: 'WB',
      postalCode: '700002',
      country: 'India',
      isDefault: false,
    });

    await deleteAddressUseCase.execute(userId, defaultAddress.id);

    const remaining = await repository.findByUserId(userId);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(second.id);
    expect(remaining[0].isDefault).toBe(true);
  });

  it('prevents unsetting the default address without switching', async () => {
    const userId = 'user-1';

    const created = await createAddressUseCase.execute(userId, {
      label: 'Home',
      line1: '3 Lake View',
      city: 'Jaipur',
      state: 'RJ',
      postalCode: '302001',
      country: 'India',
      isDefault: true,
    });

    await expect(
      updateAddressUseCase.execute(userId, created.id, { isDefault: false }),
    ).rejects.toThrow(InvalidDefaultAddressUpdateException);
  });
});
