import { AddressDto } from '../../address/dto';
import { UserProfileDto } from './user.dto';

/**
 * User Context DTO
 *
 * Read-only composition for demo purposes.
 */
export interface UserContextDto {
  user: UserProfileDto;
  addresses: AddressDto[];
}
