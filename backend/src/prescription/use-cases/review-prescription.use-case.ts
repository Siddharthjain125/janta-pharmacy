import { Inject, Injectable } from '@nestjs/common';
import { PRESCRIPTION_REPOSITORY, IPrescriptionRepository } from '../repositories';
import { PrescriptionDto, toPrescriptionDto } from '../dto';
import { PrescriptionStatus } from '../domain';
import { InvalidPrescriptionStatusException, PrescriptionNotFoundException } from '../exceptions';

export type ReviewDecision = 'APPROVE' | 'REJECT';

/**
 * ReviewPrescriptionUseCase
 *
 * Approves or rejects a pending prescription.
 */
@Injectable()
export class ReviewPrescriptionUseCase {
  constructor(
    @Inject(PRESCRIPTION_REPOSITORY)
    private readonly prescriptionRepository: IPrescriptionRepository,
  ) {}

  async execute(
    prescriptionId: string,
    decision: ReviewDecision,
    rejectionReason?: string,
  ): Promise<PrescriptionDto> {
    const prescription = await this.prescriptionRepository.findById(prescriptionId);
    if (!prescription) {
      throw new PrescriptionNotFoundException(prescriptionId);
    }

    if (prescription.status !== PrescriptionStatus.PENDING) {
      const target =
        decision === 'APPROVE' ? PrescriptionStatus.APPROVED : PrescriptionStatus.REJECTED;
      throw new InvalidPrescriptionStatusException(prescription.status, target);
    }

    const status =
      decision === 'APPROVE' ? PrescriptionStatus.APPROVED : PrescriptionStatus.REJECTED;

    const updated = await this.prescriptionRepository.updateStatus(prescriptionId, {
      status,
      reviewedAt: new Date(),
      rejectionReason: decision === 'REJECT' ? (rejectionReason ?? null) : null,
    });

    if (!updated) {
      throw new PrescriptionNotFoundException(prescriptionId);
    }

    return toPrescriptionDto(updated);
  }
}
