import { Inject, Injectable } from '@nestjs/common';
import { PRESCRIPTION_REPOSITORY, IPrescriptionRepository } from '../repositories';
import { PrescriptionDto, toPrescriptionDto } from '../dto';

/**
 * GetPendingPrescriptionsUseCase
 *
 * Returns all prescriptions awaiting review.
 */
@Injectable()
export class GetPendingPrescriptionsUseCase {
  constructor(
    @Inject(PRESCRIPTION_REPOSITORY)
    private readonly prescriptionRepository: IPrescriptionRepository,
  ) {}

  async execute(): Promise<PrescriptionDto[]> {
    const prescriptions = await this.prescriptionRepository.findPending();
    return prescriptions.map((prescription) => toPrescriptionDto(prescription));
  }
}
