/**
 * Prescription Aggregate Root
 *
 * Represents a user-owned prescription with explicit review lifecycle.
 */
export enum PrescriptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Prescription {
  readonly id: string;
  readonly userId: string;
  readonly fileReference: string;
  readonly status: PrescriptionStatus;
  readonly createdAt: Date;
  readonly reviewedAt: Date | null;
  readonly rejectionReason: string | null;
}

export interface CreatePrescriptionData {
  userId: string;
  fileReference: string;
}

export interface UpdatePrescriptionStatusData {
  status: PrescriptionStatus;
  reviewedAt: Date;
  rejectionReason?: string | null;
}

export function createPrescription(
  id: string,
  data: CreatePrescriptionData,
  now: Date = new Date(),
): Prescription {
  return {
    id,
    userId: data.userId,
    fileReference: data.fileReference,
    status: PrescriptionStatus.PENDING,
    createdAt: now,
    reviewedAt: null,
    rejectionReason: null,
  };
}
