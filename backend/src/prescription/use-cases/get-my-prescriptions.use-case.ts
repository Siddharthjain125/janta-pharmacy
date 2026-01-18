import { Inject, Injectable } from '@nestjs/common';
import { PRESCRIPTION_REPOSITORY, IPrescriptionRepository } from '../repositories';
import { PrescriptionDto, toPrescriptionDto } from '../dto';

/**
 * GetMyPrescriptionsUseCase
 *
 * Returns prescriptions owned by the authenticated user.
 */
@Injectable()
export class GetMyPrescriptionsUseCase {
  constructor(
    @Inject(PRESCRIPTION_REPOSITORY)
    private readonly prescriptionRepository: IPrescriptionRepository,
  ) {}

  async execute(userId: string): Promise<PrescriptionDto[]> {
    const prescriptions = await this.prescriptionRepository.findByUserId(userId);
    return prescriptions.map((prescription) => toPrescriptionDto(prescription));
  }
}
