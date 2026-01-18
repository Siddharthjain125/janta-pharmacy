import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiResponse } from '../common/api/api-response';
import { AddressDto, CreateAddressDto, UpdateAddressDto } from './dto';
import { GetMyAddressesUseCase } from './use-cases/get-my-addresses.use-case';
import { CreateAddressUseCase } from './use-cases/create-address.use-case';
import { UpdateAddressUseCase } from './use-cases/update-address.use-case';
import { DeleteAddressUseCase } from './use-cases/delete-address.use-case';

/**
 * Address Controller
 *
 * Self-service address management for authenticated users.
 */
@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(
    private readonly getMyAddressesUseCase: GetMyAddressesUseCase,
    private readonly createAddressUseCase: CreateAddressUseCase,
    private readonly updateAddressUseCase: UpdateAddressUseCase,
    private readonly deleteAddressUseCase: DeleteAddressUseCase,
  ) {}

  /**
   * Get current user's addresses
   * GET /api/v1/addresses
   */
  @Get()
  async getMyAddresses(@CurrentUser('id') userId: string): Promise<ApiResponse<AddressDto[]>> {
    const addresses = await this.getMyAddressesUseCase.execute(userId);
    return ApiResponse.success(addresses, 'Addresses retrieved successfully');
  }

  /**
   * Create new address for current user
   * POST /api/v1/addresses
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ): Promise<ApiResponse<AddressDto>> {
    const address = await this.createAddressUseCase.execute(userId, dto);
    return ApiResponse.success(address, 'Address created successfully');
  }

  /**
   * Update existing address
   * PATCH /api/v1/addresses/:id
   */
  @Patch(':id')
  async updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<ApiResponse<AddressDto>> {
    const address = await this.updateAddressUseCase.execute(userId, addressId, dto);
    return ApiResponse.success(address, 'Address updated successfully');
  }

  /**
   * Delete address
   * DELETE /api/v1/addresses/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ): Promise<ApiResponse<{ id: string; deleted: boolean }>> {
    await this.deleteAddressUseCase.execute(userId, addressId);
    return ApiResponse.success({ id: addressId, deleted: true }, 'Address deleted successfully');
  }
}
