import { Inject, Injectable } from '@nestjs/common';
import {
  ORDER_REPOSITORY,
  IOrderRepository,
} from '../order/repositories/order-repository.interface';
import { PRODUCT_REPOSITORY } from '../catalog/repositories/product-repository.interface';
import { IProductRepository } from '../catalog/repositories/product-repository.interface';
import { PRESCRIPTION_REPOSITORY } from '../prescription/repositories/prescription-repository.interface';
import { IPrescriptionRepository } from '../prescription/repositories/prescription-repository.interface';
import { CONSULTATION_REQUEST_REPOSITORY } from '../consultation/repositories/consultation-request-repository.interface';
import { IConsultationRequestRepository } from '../consultation/repositories/consultation-request-repository.interface';
import { IOrderPrescriptionLinkRepository } from './order-prescription-link-repository.interface';
import { ORDER_PRESCRIPTION_LINK_REPOSITORY } from './order-prescription-link-repository.interface';
import { IOrderConsultationLinkRepository } from './order-consultation-link-repository.interface';
import { ORDER_CONSULTATION_LINK_REPOSITORY } from './order-consultation-link-repository.interface';
import { PrescriptionStatus } from '../prescription/domain';
import { ConsultationStatus } from '../consultation/domain';
import { ComplianceStatus } from './compliance-status';

/**
 * Order Compliance Service (Compliance Gate)
 *
 * Centralized evaluation of whether an order may proceed to fulfilment.
 * Implements ADR-0055: fulfilment is blocked until compliance approval;
 * payment is never blocked by compliance.
 *
 * Rules:
 * - Order with no prescription-required items → APPROVED
 * - Order with prescription-required items:
 *   - APPROVED if at least one linked prescription is APPROVED
 *   - APPROVED if at least one linked consultation request is APPROVED
 *   - REJECTED only if explicitly rejected (and no approved path)
 *   - Otherwise → PENDING
 */
@Injectable()
export class OrderComplianceService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRESCRIPTION_REPOSITORY)
    private readonly prescriptionRepository: IPrescriptionRepository,
    @Inject(CONSULTATION_REQUEST_REPOSITORY)
    private readonly consultationRepository: IConsultationRequestRepository,
    @Inject(ORDER_PRESCRIPTION_LINK_REPOSITORY)
    private readonly prescriptionLinkRepository: IOrderPrescriptionLinkRepository,
    @Inject(ORDER_CONSULTATION_LINK_REPOSITORY)
    private readonly consultationLinkRepository: IOrderConsultationLinkRepository,
  ) {}

  /**
   * Whether the order is allowed to proceed to fulfilment.
   */
  async canFulfil(orderId: string): Promise<boolean> {
    const status = await this.getComplianceStatus(orderId);
    return status === ComplianceStatus.APPROVED;
  }

  /**
   * Derived compliance status for the order (not an order state).
   */
  async getComplianceStatus(orderId: string): Promise<ComplianceStatus> {
    const order = await this.orderRepository.findById(orderId);
    if (!order || !order.items.length) {
      return ComplianceStatus.PENDING;
    }

    const productIds = order.items.map((item) => item.productId);
    const hasPrescriptionRequired = await this.orderHasPrescriptionRequiredItems(productIds);
    if (!hasPrescriptionRequired) {
      return ComplianceStatus.APPROVED;
    }

    const [prescriptionIds, consultationIds] = await Promise.all([
      this.prescriptionLinkRepository.findPrescriptionIdsByOrderId(orderId),
      this.consultationLinkRepository.findConsultationRequestIdsByOrderId(orderId),
    ]);

    let hasApprovedPrescription = false;
    let hasApprovedConsultation = false;
    let hasRejected = false;

    for (const id of prescriptionIds) {
      const p = await this.prescriptionRepository.findById(id);
      if (!p) continue;
      if (p.status === PrescriptionStatus.APPROVED) hasApprovedPrescription = true;
      if (p.status === PrescriptionStatus.REJECTED) hasRejected = true;
    }
    for (const id of consultationIds) {
      const c = await this.consultationRepository.findById(id);
      if (!c) continue;
      if (c.status === ConsultationStatus.APPROVED) hasApprovedConsultation = true;
      if (c.status === ConsultationStatus.REJECTED) hasRejected = true;
    }

    if (hasApprovedPrescription || hasApprovedConsultation) {
      return ComplianceStatus.APPROVED;
    }
    if (hasRejected && prescriptionIds.length + consultationIds.length > 0) {
      return ComplianceStatus.REJECTED;
    }
    return ComplianceStatus.PENDING;
  }

  private async orderHasPrescriptionRequiredItems(productIds: string[]): Promise<boolean> {
    for (const productId of productIds) {
      const product = await this.productRepository.findById(productId);
      if (product?.requiresPrescription) return true;
    }
    return false;
  }
}
