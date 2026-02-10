/**
 * Consultation Request Aggregate Root
 *
 * Represents a user's request for doctor consultation.
 * Lifecycle: PENDING → APPROVED / REJECTED (ADR-0055 compliance path B).
 * Separate aggregate from Prescription; does not reference Order.
 */
export enum ConsultationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ConsultationRequest {
  readonly id: string;
  readonly userId: string;
  readonly status: ConsultationStatus;
  readonly createdAt: Date;
  readonly reviewedAt: Date | null;
  readonly rejectionReason: string | null;
}

export interface CreateConsultationRequestData {
  userId: string;
}

export interface UpdateConsultationStatusData {
  status: ConsultationStatus;
  reviewedAt: Date;
  rejectionReason?: string | null;
}
