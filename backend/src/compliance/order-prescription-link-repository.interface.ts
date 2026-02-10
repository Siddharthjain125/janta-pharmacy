/**
 * Order–Prescription link repository.
 * Order references compliance artifacts; used by OrderComplianceService only.
 */
export interface IOrderPrescriptionLinkRepository {
  findPrescriptionIdsByOrderId(orderId: string): Promise<string[]>;
  addLink(orderId: string, prescriptionId: string): Promise<void>;
}

export const ORDER_PRESCRIPTION_LINK_REPOSITORY = 'ORDER_PRESCRIPTION_LINK_REPOSITORY';
