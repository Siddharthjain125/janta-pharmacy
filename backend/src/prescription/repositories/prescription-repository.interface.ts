import {
  Prescription,
  CreatePrescriptionData,
  UpdatePrescriptionStatusData,
  PrescriptionStatus,
} from '../domain';

/**
 * Prescription Repository Interface
 */
export interface IPrescriptionRepository {
  save(data: CreatePrescriptionData): Promise<Prescription>;
  findById(id: string): Promise<Prescription | null>;
  findByUserId(userId: string): Promise<Prescription[]>;
  findPending(): Promise<Prescription[]>;
  updateStatus(id: string, data: UpdatePrescriptionStatusData): Promise<Prescription | null>;
  countByStatus(status: PrescriptionStatus): Promise<number>;
}

export const PRESCRIPTION_REPOSITORY = 'PRESCRIPTION_REPOSITORY';
