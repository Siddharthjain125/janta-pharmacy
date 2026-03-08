import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * Request body for POST /orders/:orderId/payment/upi-proof
 */
export class UpiProofDto {
  /** UPI transaction reference number */
  @IsString()
  @IsNotEmpty()
  referenceId!: string;

  /** File/image reference for payment screenshot */
  @IsString()
  @IsOptional()
  proofReference?: string;
}
