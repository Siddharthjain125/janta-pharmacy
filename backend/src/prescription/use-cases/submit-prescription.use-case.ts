import { Inject, Injectable } from '@nestjs/common';
import { PRESCRIPTION_REPOSITORY, IPrescriptionRepository } from '../repositories';
import { PrescriptionDto, SubmitPrescriptionDto, toPrescriptionDto } from '../dto';

/**
 * SubmitPrescriptionUseCase
 *
 * Creates a new prescription in PENDING status for authenticated user.
 */
@Injectable()
export class SubmitPrescriptionUseCase {
  constructor(
    @Inject(PRESCRIPTION_REPOSITORY)
    private readonly prescriptionRepository: IPrescriptionRepository,
  ) {}

  async execute(userId: string, dto: SubmitPrescriptionDto): Promise<PrescriptionDto> {
    const prescription = await this.prescriptionRepository.save({
      userId,
      fileReference: dto.fileReference,
    });
    return toPrescriptionDto(prescription);
  }
}
