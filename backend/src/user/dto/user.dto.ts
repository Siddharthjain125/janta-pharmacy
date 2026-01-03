import { UserStatus } from '../domain/user-status';
import { UserRole } from '../domain/user-role';

/**
 * User DTOs
 *
 * Data Transfer Objects for API requests and responses.
 * These are separate from the domain entity to control
 * what data crosses the API boundary.
 */

/**
 * User data returned in API responses
 * Excludes sensitive fields
 */
export interface UserDto {
  id: string;
  phoneNumber: string;
  email: string | null;
  name: string | null;
  roles: UserRole[];
  status: UserStatus;
  createdAt: string; // ISO 8601 string
}

/**
 * Request body for creating a new user
 */
export interface CreateUserDto {
  phoneNumber: string;
  email?: string;
  name?: string;
}

/**
 * Request body for updating a user
 */
export interface UpdateUserDto {
  email?: string | null;
  name?: string | null;
}

/**
 * Query parameters for listing users
 */
export interface ListUsersQueryDto {
  page?: number;
  limit?: number;
}

/**
 * Convert domain User to UserDto for API response
 */
export function toUserDto(user: {
  id: string;
  phoneNumber: string;
  email: string | null;
  name: string | null;
  roles: UserRole[];
  status: UserStatus;
  createdAt: Date;
}): UserDto {
  return {
    id: user.id,
    phoneNumber: maskPhoneNumber(user.phoneNumber),
    email: user.email,
    name: user.name,
    roles: user.roles,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Mask phone number for privacy in responses
 * Shows first 4 and last 2 characters
 */
function maskPhoneNumber(phone: string): string {
  if (phone.length <= 6) return phone;
  return phone.slice(0, 4) + '****' + phone.slice(-2);
}

/**
 * Full phone number DTO (for authenticated user viewing their own data)
 */
export interface UserSelfDto extends Omit<UserDto, 'phoneNumber'> {
  phoneNumber: string; // Unmasked
}

/**
 * Convert domain User to UserSelfDto (unmasked)
 */
export function toUserSelfDto(user: {
  id: string;
  phoneNumber: string;
  email: string | null;
  name: string | null;
  roles: UserRole[];
  status: UserStatus;
  createdAt: Date;
}): UserSelfDto {
  return {
    id: user.id,
    phoneNumber: user.phoneNumber, // Not masked
    email: user.email,
    name: user.name,
    roles: user.roles,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}

