import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrescriptionAdminController, PrescriptionController } from './prescription.controller';
import { PrescriptionRepositoryProvider } from '../database/repository.providers';
import { SubmitPrescriptionUseCase } from './use-cases/submit-prescription.use-case';
import { GetMyPrescriptionsUseCase } from './use-cases/get-my-prescriptions.use-case';
import { GetPendingPrescriptionsUseCase } from './use-cases/get-pending-prescriptions.use-case';
import { ReviewPrescriptionUseCase } from './use-cases/review-prescription.use-case';
import { PRESCRIPTION_REPOSITORY } from './repositories/prescription-repository.interface';

/**
 * Prescription Module
 *
 * Handles prescription management including:
 * - Prescription uploads and verification
 * - Prescription-product linking
 * - Prescription status tracking
 *
 * This module maintains its own data boundaries and
 * does not directly access other module's data.
 */
@Module({
  imports: [AuthModule],
  controllers: [PrescriptionController, PrescriptionAdminController],
  providers: [
    PrescriptionRepositoryProvider,
    SubmitPrescriptionUseCase,
    GetMyPrescriptionsUseCase,
    GetPendingPrescriptionsUseCase,
    ReviewPrescriptionUseCase,
  ],
  exports: [PRESCRIPTION_REPOSITORY],
})
export class PrescriptionModule {}
