import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../interfaces/auth-user.interface';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * 
 * Usage:
 *   @Roles(UserRole.ADMIN)
 *   @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
