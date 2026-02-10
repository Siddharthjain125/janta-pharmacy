import { OrderComplianceService } from './order-compliance.service';
import { ComplianceStatus } from './compliance-status';
import { ORDER_REPOSITORY } from '../order/repositories/order-repository.interface';
import { InMemoryOrderRepository } from '../order/repositories/in-memory-order.repository';
import { PRODUCT_REPOSITORY } from '../catalog/repositories/product-repository.interface';
import { InMemoryProductRepository } from '../catalog/repositories/in-memory-product.repository';
import { PRESCRIPTION_REPOSITORY } from '../prescription/repositories/prescription-repository.interface';
import { InMemoryPrescriptionRepository } from '../prescription/repositories/in-memory-prescription.repository';
import { CONSULTATION_REQUEST_REPOSITORY } from '../consultation/repositories/consultation-request-repository.interface';
import { InMemoryConsultationRequestRepository } from '../consultation/repositories/in-memory-consultation-request.repository';
import { InMemoryOrderPrescriptionLinkRepository } from './in-memory-order-prescription-link.repository';
import { InMemoryOrderConsultationLinkRepository } from './in-memory-order-consultation-link.repository';
import { OrderStatus } from '../order/domain';
import { createOrderItem } from '../order/domain/order-item';
import { PrescriptionStatus } from '../prescription/domain';
import { ConsultationStatus as ConsultationStatusEnum } from '../consultation/domain';

/**
 * OrderComplianceService tests (ADR-0055).
 *
 * Verifies:
 * - Order without prescription requirements is always fulfilable
 * - Order with pending prescription is NOT fulfilable
 * - Order with approved prescription IS fulfilable
 * - Order with approved consultation IS fulfilable
 * - Rejected compliance blocks fulfilment
 * - Compliance approval after rejection unblocks fulfilment
 */
describe('OrderComplianceService', () => {
  let service: OrderComplianceService;
  let orderRepository: InMemoryOrderRepository;
  let productRepository: InMemoryProductRepository;
  let prescriptionRepository: InMemoryPrescriptionRepository;
  let consultationRepository: InMemoryConsultationRequestRepository;
  let prescriptionLinkRepository: InMemoryOrderPrescriptionLinkRepository;
  let consultationLinkRepository: InMemoryOrderConsultationLinkRepository;

  const userId = 'user-1';
  const generalProductId = 'prod-001'; // Paracetamol - no prescription required
  const prescriptionProductId = 'prod-003'; // Amoxicillin - prescription required

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    productRepository = new InMemoryProductRepository();
    prescriptionRepository = new InMemoryPrescriptionRepository();
    consultationRepository = new InMemoryConsultationRequestRepository();
    prescriptionLinkRepository = new InMemoryOrderPrescriptionLinkRepository();
    consultationLinkRepository = new InMemoryOrderConsultationLinkRepository();

    service = new OrderComplianceService(
      orderRepository,
      productRepository,
      prescriptionRepository,
      consultationRepository,
      prescriptionLinkRepository,
      consultationLinkRepository,
    );
  });

  async function createOrderWithItems(
    productIds: string[],
    status: OrderStatus = OrderStatus.CONFIRMED,
  ): Promise<string> {
    const order = await orderRepository.createOrder(userId, OrderStatus.DRAFT);
    for (const productId of productIds) {
      const product = await productRepository.findById(productId);
      if (!product) throw new Error(`Product ${productId} not found`);
      const item = createOrderItem({
        productId: product.id.toString(),
        productName: product.name,
        unitPrice: product.price,
        quantity: 1,
      });
      await orderRepository.addItem(order.id, item);
    }
    await orderRepository.updateStatus(order.id, status);
    const updated = await orderRepository.findById(order.id);
    return updated!.id;
  }

  it('order without prescription-required items is always fulfilable', async () => {
    const orderId = await createOrderWithItems([generalProductId]);
    expect(await service.canFulfil(orderId)).toBe(true);
    expect(await service.getComplianceStatus(orderId)).toBe(ComplianceStatus.APPROVED);
  });

  it('order with prescription-required items and no links is PENDING and not fulfilable', async () => {
    const orderId = await createOrderWithItems([prescriptionProductId]);
    expect(await service.canFulfil(orderId)).toBe(false);
    expect(await service.getComplianceStatus(orderId)).toBe(ComplianceStatus.PENDING);
  });

  it('order with pending linked prescription is not fulfilable', async () => {
    const orderId = await createOrderWithItems([prescriptionProductId]);
    const prescription = await prescriptionRepository.save({
      userId,
      fileReference: 'file-1',
    });
    await prescriptionLinkRepository.addLink(orderId, prescription.id);
    expect(await service.canFulfil(orderId)).toBe(false);
    expect(await service.getComplianceStatus(orderId)).toBe(ComplianceStatus.PENDING);
  });

  it('order with approved prescription is fulfilable', async () => {
    const orderId = await createOrderWithItems([prescriptionProductId]);
    const prescription = await prescriptionRepository.save({
      userId,
      fileReference: 'file-1',
    });
    await prescriptionRepository.updateStatus(prescription.id, {
      status: PrescriptionStatus.APPROVED,
      reviewedAt: new Date(),
    });
    await prescriptionLinkRepository.addLink(orderId, prescription.id);
    expect(await service.canFulfil(orderId)).toBe(true);
    expect(await service.getComplianceStatus(orderId)).toBe(ComplianceStatus.APPROVED);
  });

  it('order with approved consultation is fulfilable', async () => {
    const orderId = await createOrderWithItems([prescriptionProductId]);
    const consultation = await consultationRepository.save({ userId });
    await consultationRepository.updateStatus(consultation.id, {
      status: ConsultationStatusEnum.APPROVED,
      reviewedAt: new Date(),
    });
    await consultationLinkRepository.addLink(orderId, consultation.id);
    expect(await service.canFulfil(orderId)).toBe(true);
    expect(await service.getComplianceStatus(orderId)).toBe(ComplianceStatus.APPROVED);
  });

  it('rejected compliance blocks fulfilment', async () => {
    const orderId = await createOrderWithItems([prescriptionProductId]);
    const prescription = await prescriptionRepository.save({
      userId,
      fileReference: 'file-1',
    });
    await prescriptionRepository.updateStatus(prescription.id, {
      status: PrescriptionStatus.REJECTED,
      reviewedAt: new Date(),
      rejectionReason: 'Invalid',
    });
    await prescriptionLinkRepository.addLink(orderId, prescription.id);
    expect(await service.canFulfil(orderId)).toBe(false);
    expect(await service.getComplianceStatus(orderId)).toBe(ComplianceStatus.REJECTED);
  });

  it('compliance approval after rejection unblocks fulfilment', async () => {
    const orderId = await createOrderWithItems([prescriptionProductId]);
    const prescription = await prescriptionRepository.save({
      userId,
      fileReference: 'file-1',
    });
    await prescriptionRepository.updateStatus(prescription.id, {
      status: PrescriptionStatus.REJECTED,
      reviewedAt: new Date(),
      rejectionReason: 'Invalid',
    });
    await prescriptionLinkRepository.addLink(orderId, prescription.id);
    expect(await service.canFulfil(orderId)).toBe(false);

    const consultation = await consultationRepository.save({ userId });
    await consultationRepository.updateStatus(consultation.id, {
      status: ConsultationStatusEnum.APPROVED,
      reviewedAt: new Date(),
    });
    await consultationLinkRepository.addLink(orderId, consultation.id);
    expect(await service.canFulfil(orderId)).toBe(true);
    expect(await service.getComplianceStatus(orderId)).toBe(ComplianceStatus.APPROVED);
  });

  it('order with mixed items (general + prescription) requires compliance when prescription item present', async () => {
    const orderId = await createOrderWithItems([generalProductId, prescriptionProductId]);
    expect(await service.canFulfil(orderId)).toBe(false);
    const prescription = await prescriptionRepository.save({
      userId,
      fileReference: 'file-1',
    });
    await prescriptionRepository.updateStatus(prescription.id, {
      status: PrescriptionStatus.APPROVED,
      reviewedAt: new Date(),
    });
    await prescriptionLinkRepository.addLink(orderId, prescription.id);
    expect(await service.canFulfil(orderId)).toBe(true);
  });
});
