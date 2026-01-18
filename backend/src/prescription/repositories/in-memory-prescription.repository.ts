import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  Prescription,
  CreatePrescriptionData,
  UpdatePrescriptionStatusData,
  PrescriptionStatus,
  createPrescription,
} from '../domain';
import { IPrescriptionRepository } from './prescription-repository.interface';

@Injectable()
export class InMemoryPrescriptionRepository implements IPrescriptionRepository {
  private readonly prescriptions: Map<string, Prescription> = new Map();

  async save(data: CreatePrescriptionData): Promise<Prescription> {
    const id = randomUUID();
    const prescription = createPrescription(id, data);
    this.prescriptions.set(id, prescription);
    return prescription;
  }

  async findById(id: string): Promise<Prescription | null> {
    return this.prescriptions.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values())
      .filter((prescription) => prescription.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findPending(): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values())
      .filter((prescription) => prescription.status === PrescriptionStatus.PENDING)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async updateStatus(id: string, data: UpdatePrescriptionStatusData): Promise<Prescription | null> {
    const existing = this.prescriptions.get(id);
    if (!existing) return null;

    const updated: Prescription = {
      ...existing,
      status: data.status,
      reviewedAt: data.reviewedAt,
      rejectionReason: data.rejectionReason ?? null,
    };

    this.prescriptions.set(id, updated);
    return updated;
  }

  async countByStatus(status: PrescriptionStatus): Promise<number> {
    let count = 0;
    for (const prescription of this.prescriptions.values()) {
      if (prescription.status === status) {
        count += 1;
      }
    }
    return count;
  }

  clear(): void {
    this.prescriptions.clear();
  }
}
