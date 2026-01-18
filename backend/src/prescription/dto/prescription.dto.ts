import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Prescription, PrescriptionStatus } from '../domain';

export interface PrescriptionDto {
  id: string;
  userId: string;
  fileReference: string;
  status: PrescriptionStatus;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export class SubmitPrescriptionDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  fileReference: string;
}

export class RejectPrescriptionDto {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  rejectionReason?: string;
}

export function toPrescriptionDto(prescription: Prescription): PrescriptionDto {
  return {
    id: prescription.id,
    userId: prescription.userId,
    fileReference: prescription.fileReference,
    status: prescription.status,
    createdAt: prescription.createdAt.toISOString(),
    reviewedAt: prescription.reviewedAt ? prescription.reviewedAt.toISOString() : null,
    rejectionReason: prescription.rejectionReason,
  };
}
