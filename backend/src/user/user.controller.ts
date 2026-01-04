import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from '../common/api/api-response';
import { CreateUserDto, UpdateUserDto, UserDto, UserSelfDto } from './dto';

/**
 * User Controller
 *
 * REST endpoints for user identity management.
 *
 * Design notes:
 * - No authentication endpoints here (that's AuthController)
 * - GET /users/me requires authentication (to be enforced later)
 * - Admin endpoints require ADMIN role (to be enforced later)
 */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new user
   * POST /api/v1/users
   *
   * This is the registration endpoint for identity creation.
   * No authentication required (public).
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() dto: CreateUserDto,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<UserDto>> {
    const user = await this.userService.createUser(dto, correlationId);
    return ApiResponse.success(user, 'User created successfully');
  }

  /**
   * Get current user's profile
   * GET /api/v1/users/me
   *
   * Returns unmasked phone number for authenticated user.
   * TODO: Requires authentication guard
   */
  @Get('me')
  async getCurrentUser(
    @Headers('x-user-id') userId: string, // TODO: Replace with @CurrentUser decorator
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<UserSelfDto>> {
    // TODO: Get userId from JWT token via guard
    const profile = await this.userService.getSelfProfile(userId, correlationId);
    return ApiResponse.success(profile, 'Profile retrieved successfully');
  }

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   *
   * Returns masked phone number.
   * TODO: Requires authentication guard
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<UserDto>> {
    const user = await this.userService.findById(id, correlationId);
    return ApiResponse.success(user, 'User retrieved successfully');
  }

  /**
   * Update user profile
   * PUT /api/v1/users/:id
   *
   * TODO: Requires authentication - user can only update their own profile
   */
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<UserDto>> {
    const user = await this.userService.updateUser(id, dto, correlationId);
    return ApiResponse.success(user, 'User updated successfully');
  }

  /**
   * List all users (admin only)
   * GET /api/v1/users
   *
   * TODO: Requires ADMIN role
   */
  @Get()
  async listUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<ApiResponse<{ users: UserDto[]; total: number; page: number; limit: number }>> {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

    const result = await this.userService.listUsers(pageNum, limitNum);

    return ApiResponse.success(
      {
        ...result,
        page: pageNum,
        limit: limitNum,
      },
      'Users retrieved successfully',
    );
  }

  /**
   * Find user by phone number
   * GET /api/v1/users/by-phone/:phoneNumber
   *
   * TODO: Requires authentication
   */
  @Get('by-phone/:phoneNumber')
  async findByPhone(
    @Param('phoneNumber') phoneNumber: string,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<UserDto>> {
    const user = await this.userService.findByPhoneNumber(phoneNumber, correlationId);
    return ApiResponse.success(user, 'User retrieved successfully');
  }
}
