import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/business.exception';
import { PrescriptionStatus } from '../domain';

export class PrescriptionNotFoundException extends BusinessException {
  constructor(id: string) {
    super('PRESCRIPTION_NOT_FOUND', `Prescription '${id}' not found`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidPrescriptionStatusException extends BusinessException {
  constructor(currentStatus: PrescriptionStatus, targetStatus: PrescriptionStatus) {
    super(
      'INVALID_PRESCRIPTION_STATUS',
      `Cannot transition prescription from '${currentStatus}' to '${targetStatus}'`,
      HttpStatus.CONFLICT,
    );
  }
}
