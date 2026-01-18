import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  Prescription,
  CreatePrescriptionData,
  UpdatePrescriptionStatusData,
  PrescriptionStatus,
} from '../domain';
import { IPrescriptionRepository } from './prescription-repository.interface';

type PrismaPrescriptionRecord = {
  id: string;
  userId: string;
  fileReference: string;
  status: PrescriptionStatus;
  createdAt: Date;
  reviewedAt: Date | null;
  rejectionReason: string | null;
};

type PrismaPrescriptionClient = {
  create(args: {
    data: { userId: string; fileReference: string; status: PrescriptionStatus };
  }): Promise<PrismaPrescriptionRecord>;
  findUnique(args: { where: { id: string } }): Promise<PrismaPrescriptionRecord | null>;
  findMany(args: {
    where?: { userId?: string; status?: PrescriptionStatus };
    orderBy?: { createdAt: 'asc' | 'desc' };
  }): Promise<PrismaPrescriptionRecord[]>;
  update(args: {
    where: { id: string };
    data: Partial<PrismaPrescriptionRecord>;
  }): Promise<PrismaPrescriptionRecord>;
  count(args: { where?: { status?: PrescriptionStatus } }): Promise<number>;
};

@Injectable()
export class PrismaPrescriptionRepository implements IPrescriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: CreatePrescriptionData): Promise<Prescription> {
    const prescription = await this.prescriptionClient.create({
      data: {
        userId: data.userId,
        fileReference: data.fileReference,
        status: PrescriptionStatus.PENDING,
      },
    });
    return this.toDomain(prescription);
  }

  async findById(id: string): Promise<Prescription | null> {
    const prescription = await this.prescriptionClient.findUnique({ where: { id } });
    return prescription ? this.toDomain(prescription) : null;
  }

  async findByUserId(userId: string): Promise<Prescription[]> {
    const prescriptions = await this.prescriptionClient.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return prescriptions.map((prescription) => this.toDomain(prescription));
  }

  async findPending(): Promise<Prescription[]> {
    const prescriptions = await this.prescriptionClient.findMany({
      where: { status: PrescriptionStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });
    return prescriptions.map((prescription) => this.toDomain(prescription));
  }

  async updateStatus(id: string, data: UpdatePrescriptionStatusData): Promise<Prescription | null> {
    try {
      const prescription = await this.prescriptionClient.update({
        where: { id },
        data: {
          status: data.status,
          reviewedAt: data.reviewedAt,
          rejectionReason: data.rejectionReason ?? null,
        },
      });
      return this.toDomain(prescription);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async countByStatus(status: PrescriptionStatus): Promise<number> {
    return this.prescriptionClient.count({ where: { status } });
  }

  private get prescriptionClient(): PrismaPrescriptionClient {
    return (this.prisma as PrismaService & { prescription: PrismaPrescriptionClient }).prescription;
  }

  private toDomain(prescription: PrismaPrescriptionRecord): Prescription {
    return {
      id: prescription.id,
      userId: prescription.userId,
      fileReference: prescription.fileReference,
      status: prescription.status,
      createdAt: prescription.createdAt,
      reviewedAt: prescription.reviewedAt,
      rejectionReason: prescription.rejectionReason,
    };
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    );
  }
}
