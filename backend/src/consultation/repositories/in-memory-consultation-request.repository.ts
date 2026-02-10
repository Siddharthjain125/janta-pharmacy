import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ConsultationRequest,
  CreateConsultationRequestData,
  UpdateConsultationStatusData,
  ConsultationStatus,
} from '../domain';
import { IConsultationRequestRepository } from './consultation-request-repository.interface';

@Injectable()
export class InMemoryConsultationRequestRepository implements IConsultationRequestRepository {
  private readonly requests: Map<string, ConsultationRequest> = new Map();

  async save(data: CreateConsultationRequestData): Promise<ConsultationRequest> {
    const id = randomUUID();
    const request: ConsultationRequest = {
      id,
      userId: data.userId,
      status: ConsultationStatus.PENDING,
      createdAt: new Date(),
      reviewedAt: null,
      rejectionReason: null,
    };
    this.requests.set(id, request);
    return request;
  }

  async findById(id: string): Promise<ConsultationRequest | null> {
    return this.requests.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<ConsultationRequest[]> {
    return Array.from(this.requests.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateStatus(
    id: string,
    data: UpdateConsultationStatusData,
  ): Promise<ConsultationRequest | null> {
    const existing = this.requests.get(id);
    if (!existing) return null;
    const updated: ConsultationRequest = {
      ...existing,
      status: data.status,
      reviewedAt: data.reviewedAt,
      rejectionReason: data.rejectionReason ?? null,
    };
    this.requests.set(id, updated);
    return updated;
  }
}
