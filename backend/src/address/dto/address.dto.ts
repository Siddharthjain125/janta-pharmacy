import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Address } from '../domain';

/**
 * Address DTOs
 *
 * API request/response shapes for Address aggregate.
 */

export interface AddressDto {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  label: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  line1: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  line2?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  state: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  country: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  label?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  line1?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  line2?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  state?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  country?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

/**
 * Convert domain Address to AddressDto
 */
export function toAddressDto(address: Address): AddressDto {
  return {
    id: address.id,
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}
