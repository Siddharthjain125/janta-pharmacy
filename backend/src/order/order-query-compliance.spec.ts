import { OrderQueryService } from './order-query.service';
import { InMemoryOrderRepository } from './repositories/in-memory-order.repository';
import { OrderComplianceService } from '../compliance/order-compliance.service';
import { InMemoryProductRepository } from '../catalog/repositories/in-memory-product.repository';
import { InMemoryPrescriptionRepository } from '../prescription/repositories/in-memory-prescription.repository';
import { InMemoryConsultationRequestRepository } from '../consultation/repositories/in-memory-consultation-request.repository';
import { InMemoryOrderPrescriptionLinkRepository } from '../compliance/in-memory-order-prescription-link.repository';
import { InMemoryOrderConsultationLinkRepository } from '../compliance/in-memory-order-consultation-link.repository';
import { OrderStatus } from './domain';
import { createOrderItem } from './domain/order-item';
import { PrescriptionStatus } from '../prescription/domain';
import { ConsultationStatus } from '../consultation/domain';

/**
 * OrderQueryService compliance tests (ADR-0055).
 *
 * Verifies GET /orders/:id includes read-only compliance when order requires prescription.
 * Uses in-memory repositories only. Order state machine unchanged.
 */
describe('OrderQueryService - order detail compliance', () => {
  let queryService: OrderQueryService;
  let orderRepository: InMemoryOrderRepository;
  let productRepository: InMemoryProductRepository;
  let prescriptionRepository: InMemoryPrescriptionRepository;
  let consultationRepository: InMemoryConsultationRequestRepository;
  let prescriptionLinkRepository: InMemoryOrderPrescriptionLinkRepository;
  let consultationLinkRepository: InMemoryOrderConsultationLinkRepository;
  let complianceService: OrderComplianceService;

  const userId = 'user-1';
  const correlationId = 'test-correlation-id';
  const generalProductId = 'prod-001';
  const prescriptionProductId = 'prod-003';

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    productRepository = new InMemoryProductRepository();
    prescriptionRepository = new InMemoryPrescriptionRepository();
    consultationRepository = new InMemoryConsultationRequestRepository();
    prescriptionLinkRepository = new InMemoryOrderPrescriptionLinkRepository();
    consultationLinkRepository = new InMemoryOrderConsultationLinkRepository();
    complianceService = new OrderComplianceService(
      orderRepository,
      productRepository,
      prescriptionRepository,
      consultationRepository,
      prescriptionLinkRepository,
      consultationLinkRepository,
    );
    queryService = new OrderQueryService(orderRepository, complianceService);
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

  it('returns no compliance field when order has no prescription-required items', async () => {
    const orderId = await createOrderWithItems([generalProductId]);
    const detail = await queryService.getOrderById(orderId, userId, correlationId);

    expect(detail.compliance).toBeUndefined();
    expect(detail.state).toBe(OrderStatus.CONFIRMED);
  });

  it('returns compliance with status PENDING when order has prescription items and no links', async () => {
    const orderId = await createOrderWithItems([prescriptionProductId]);
    const detail = await queryService.getOrderById(orderId, userId, correlationId);

    expect(detail.compliance).toBeDefined();
    expect(detail.compliance!.requiresPrescription).toBe(true);
    expect(detail.compliance!.status).toBe('PENDING');
    expect(detail.compliance!.prescriptions).toBeUndefined();
    expect(detail.compliance!.consultations).toBeUndefined();
    expect(detail.state).toBe(OrderStatus.CONFIRMED);
  });

  it('returns compliance with status PENDING and linked prescription when pending', async () => {
    const orderId = await createOrderWithItems([prescriptionProductId]);
    const prescription = await prescriptionRepository.save({
      userId,
      fileReference: 'file-1',
    });
    await prescriptionLinkRepository.addLink(orderId, prescription.id);

    const detail = await queryService.getOrderById(orderId, userId, correlationId);

    expect(detail.compliance!.status).toBe('PENDING');
    expect(detail.compliance!.prescriptions).toHaveLength(1);
    expect(detail.compliance!.prescriptions![0]).toEqual({
      id: prescription.id,
      status: PrescriptionStatus.PENDING,
      rejectionReason: null,
    });
  });

  it('returns compliance with status APPROVED when prescription is approved', async () => {
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

    const detail = await queryService.getOrderById(orderId, userId, correlationId);

    expect(detail.compliance!.status).toBe('APPROVED');
    expect(detail.compliance!.prescriptions).toHaveLength(1);
    expect(detail.compliance!.prescriptions![0].status).toBe(PrescriptionStatus.APPROVED);
  });

  it('returns compliance with status REJECTED and rejectionReason when prescription rejected', async () => {
    const orderId = await createOrderWithItems([prescriptionProductId]);
    const prescription = await prescriptionRepository.save({
      userId,
      fileReference: 'file-1',
    });
    await prescriptionRepository.updateStatus(prescription.id, {
      status: PrescriptionStatus.REJECTED,
      reviewedAt: new Date(),
      rejectionReason: 'Invalid or expired',
    });
    await prescriptionLinkRepository.addLink(orderId, prescription.id);

    const detail = await queryService.getOrderById(orderId, userId, correlationId);

    expect(detail.compliance!.status).toBe('REJECTED');
    expect(detail.compliance!.prescriptions).toHaveLength(1);
    expect(detail.compliance!.prescriptions![0]).toMatchObject({
      id: prescription.id,
      status: PrescriptionStatus.REJECTED,
      rejectionReason: 'Invalid or expired',
    });
  });

  it('returns linked consultations mapped correctly', async () => {
    const orderId = await createOrderWithItems([prescriptionProductId]);
    const consultation = await consultationRepository.save({ userId });
    await consultationRepository.updateStatus(consultation.id, {
      status: ConsultationStatus.APPROVED,
      reviewedAt: new Date(),
    });
    await consultationLinkRepository.addLink(orderId, consultation.id);

    const detail = await queryService.getOrderById(orderId, userId, correlationId);

    expect(detail.compliance!.status).toBe('APPROVED');
    expect(detail.compliance!.consultations).toHaveLength(1);
    expect(detail.compliance!.consultations![0]).toEqual({
      id: consultation.id,
      status: ConsultationStatus.APPROVED,
    });
  });

  it('does not change order state', async () => {
    const orderId = await createOrderWithItems([prescriptionProductId], OrderStatus.PAID);
    const detail = await queryService.getOrderById(orderId, userId, correlationId);

    expect(detail.state).toBe(OrderStatus.PAID);
    expect(detail.compliance).toBeDefined();
  });
});
