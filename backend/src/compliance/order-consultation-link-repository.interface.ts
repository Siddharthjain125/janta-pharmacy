/**
 * Order–Consultation link repository.
 * Order references compliance artifacts; used by OrderComplianceService only.
 */
export interface IOrderConsultationLinkRepository {
  findConsultationRequestIdsByOrderId(orderId: string): Promise<string[]>;
  addLink(orderId: string, consultationRequestId: string): Promise<void>;
}

export const ORDER_CONSULTATION_LINK_REPOSITORY = 'ORDER_CONSULTATION_LINK_REPOSITORY';
