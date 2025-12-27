import { Module } from '@nestjs/common';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';

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
  controllers: [PrescriptionController],
  providers: [PrescriptionService],
  exports: [PrescriptionService],
})
export class PrescriptionModule {}

