import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

/**
 * User Module
 *
 * Handles user management including:
 * - User registration and authentication
 * - Profile management
 * - User preferences
 *
 * This module maintains its own data boundaries and
 * does not directly access other module's data.
 */
@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

