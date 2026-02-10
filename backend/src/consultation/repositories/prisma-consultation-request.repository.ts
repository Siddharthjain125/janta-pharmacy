import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  ConsultationRequest,
  CreateConsultationRequestData,
  UpdateConsultationStatusData,
  ConsultationStatus,
} from '../domain';
import { IConsultationRequestRepository } from './consultation-request-repository.interface';

@Injectable()
export class PrismaConsultationRequestRepository implements IConsultationRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: CreateConsultationRequestData): Promise<ConsultationRequest> {
    const row = await this.prisma.consultationRequest.create({
      data: { userId: data.userId, status: 'PENDING' },
    });
    return this.toDomain(row);
  }

  async findById(id: string): Promise<ConsultationRequest | null> {
    const row = await this.prisma.consultationRequest.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<ConsultationRequest[]> {
    const rows = await this.prisma.consultationRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r: { id: string; userId: string; status: string; createdAt: Date; reviewedAt: Date | null; rejectionReason: string | null }) =>
      this.toDomain(r),
    );
  }

  async updateStatus(
    id: string,
    data: UpdateConsultationStatusData,
  ): Promise<ConsultationRequest | null> {
    try {
      const row = await this.prisma.consultationRequest.update({
        where: { id },
        data: {
          status: data.status,
          reviewedAt: data.reviewedAt,
          rejectionReason: data.rejectionReason ?? null,
        },
      });
      return this.toDomain(row);
    } catch {
      return null;
    }
  }

  private toDomain(row: {
    id: string;
    userId: string;
    status: string;
    createdAt: Date;
    reviewedAt: Date | null;
    rejectionReason: string | null;
  }): ConsultationRequest {
    return {
      id: row.id,
      userId: row.userId,
      status: row.status as ConsultationStatus,
      createdAt: row.createdAt,
      reviewedAt: row.reviewedAt,
      rejectionReason: row.rejectionReason,
    };
  }
}
