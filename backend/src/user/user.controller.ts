import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from '../common/api/api-response';

/**
 * User Controller
 *
 * Exposes REST endpoints for user management.
 * All endpoints return placeholder responses.
 */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get all users with pagination
   */
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<ApiResponse<unknown>> {
    const users = await this.userService.findAll(page, limit);
    return ApiResponse.success(users, 'Users retrieved successfully');
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<unknown>> {
    const user = await this.userService.findById(id);
    return ApiResponse.success(user, 'User retrieved successfully');
  }

  /**
   * Create a new user
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: unknown): Promise<ApiResponse<unknown>> {
    const user = await this.userService.create(createUserDto);
    return ApiResponse.success(user, 'User created successfully');
  }

  /**
   * Update user by ID
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: unknown,
  ): Promise<ApiResponse<unknown>> {
    const user = await this.userService.update(id, updateUserDto);
    return ApiResponse.success(user, 'User updated successfully');
  }

  /**
   * Delete user by ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }

  /**
   * Get user profile
   */
  @Get(':id/profile')
  async getProfile(@Param('id') id: string): Promise<ApiResponse<unknown>> {
    const profile = await this.userService.getProfile(id);
    return ApiResponse.success(profile, 'Profile retrieved successfully');
  }
}

