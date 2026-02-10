import { Module, forwardRef } from '@nestjs/common';
import { OrderComplianceService } from './order-compliance.service';
import { ORDER_PRESCRIPTION_LINK_REPOSITORY } from './order-prescription-link-repository.interface';
import { ORDER_CONSULTATION_LINK_REPOSITORY } from './order-consultation-link-repository.interface';
import { InMemoryOrderPrescriptionLinkRepository } from './in-memory-order-prescription-link.repository';
import { InMemoryOrderConsultationLinkRepository } from './in-memory-order-consultation-link.repository';
import { PrismaOrderPrescriptionLinkRepository } from './prisma-order-prescription-link.repository';
import { PrismaOrderConsultationLinkRepository } from './prisma-order-consultation-link.repository';
import { PrismaService } from '../database/prisma.service';
import { getRepositoryType } from '../database/repository.providers';
import { OrderModule } from '../order/order.module';
import { CatalogModule } from '../catalog/catalog.module';
import { PrescriptionModule } from '../prescription/prescription.module';
import { ConsultationModule } from '../consultation/consultation.module';

/**
 * Compliance Module (ADR-0055)
 *
 * Provides the fulfilment gate: OrderComplianceService.
 * Payment logic must NOT import this module.
 */
@Module({
  imports: [
    forwardRef(() => OrderModule),
    CatalogModule,
    PrescriptionModule,
    ConsultationModule,
  ],
  providers: [
    OrderComplianceService,
    {
      provide: ORDER_PRESCRIPTION_LINK_REPOSITORY,
      useFactory: (prisma: PrismaService) => {
        if (getRepositoryType() === 'prisma') {
          return new PrismaOrderPrescriptionLinkRepository(prisma);
        }
        return new InMemoryOrderPrescriptionLinkRepository();
      },
      inject: [PrismaService],
    },
    {
      provide: ORDER_CONSULTATION_LINK_REPOSITORY,
      useFactory: (prisma: PrismaService) => {
        if (getRepositoryType() === 'prisma') {
          return new PrismaOrderConsultationLinkRepository(prisma);
        }
        return new InMemoryOrderConsultationLinkRepository();
      },
      inject: [PrismaService],
    },
  ],
  exports: [OrderComplianceService],
})
export class ComplianceModule {}
