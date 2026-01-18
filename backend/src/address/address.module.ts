import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AddressController } from './address.controller';
import { AddressRepositoryProvider } from '../database/repository.providers';
import { GetMyAddressesUseCase } from './use-cases/get-my-addresses.use-case';
import { CreateAddressUseCase } from './use-cases/create-address.use-case';
import { UpdateAddressUseCase } from './use-cases/update-address.use-case';
import { DeleteAddressUseCase } from './use-cases/delete-address.use-case';
import { ADDRESS_REPOSITORY } from './repositories/address-repository.interface';

/**
 * Address Module
 *
 * Owns the Address aggregate and its lifecycle.
 */
@Module({
  imports: [AuthModule],
  controllers: [AddressController],
  providers: [
    AddressRepositoryProvider,
    GetMyAddressesUseCase,
    CreateAddressUseCase,
    UpdateAddressUseCase,
    DeleteAddressUseCase,
  ],
  exports: [
    // Export repository token for testing
    ADDRESS_REPOSITORY,
  ],
})
export class AddressModule {}
