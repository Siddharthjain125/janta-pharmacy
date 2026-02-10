import {
  ConsultationRequest,
  CreateConsultationRequestData,
  UpdateConsultationStatusData,
  ConsultationStatus,
} from '../domain';

export interface IConsultationRequestRepository {
  save(data: CreateConsultationRequestData): Promise<ConsultationRequest>;
  findById(id: string): Promise<ConsultationRequest | null>;
  findByUserId(userId: string): Promise<ConsultationRequest[]>;
  updateStatus(id: string, data: UpdateConsultationStatusData): Promise<ConsultationRequest | null>;
}

export const CONSULTATION_REQUEST_REPOSITORY = 'CONSULTATION_REQUEST_REPOSITORY';
