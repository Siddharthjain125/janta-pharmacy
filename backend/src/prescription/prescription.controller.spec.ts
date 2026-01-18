import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/interfaces/auth-user.interface';
import { PrescriptionAdminController, PrescriptionController } from './prescription.controller';
import { SubmitPrescriptionUseCase } from './use-cases/submit-prescription.use-case';
import { GetMyPrescriptionsUseCase } from './use-cases/get-my-prescriptions.use-case';
import { GetPendingPrescriptionsUseCase } from './use-cases/get-pending-prescriptions.use-case';
import { ReviewPrescriptionUseCase } from './use-cases/review-prescription.use-case';

describe('PrescriptionController - User endpoints', () => {
  beforeEach(() => {
    new PrescriptionController({} as SubmitPrescriptionUseCase, {} as GetMyPrescriptionsUseCase);
  });

  it('should protect submit with JwtAuthGuard', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      PrescriptionController,
    ) as unknown[];
    expect(guards).toEqual(expect.arrayContaining([JwtAuthGuard]));
  });

  it('should protect list with JwtAuthGuard', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      PrescriptionController,
    ) as unknown[];
    expect(guards).toEqual(expect.arrayContaining([JwtAuthGuard]));
  });
});

describe('PrescriptionAdminController - Admin endpoints', () => {
  beforeEach(() => {
    new PrescriptionAdminController(
      {} as GetPendingPrescriptionsUseCase,
      {} as ReviewPrescriptionUseCase,
    );
  });

  it('should protect admin endpoints with JwtAuthGuard and RolesGuard', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      PrescriptionAdminController,
    ) as unknown[];
    expect(guards).toEqual(expect.arrayContaining([JwtAuthGuard, RolesGuard]));
  });

  it('should require ADMIN role for admin endpoints', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      PrescriptionAdminController,
    ) as UserRole[];
    expect(roles).toEqual(expect.arrayContaining([UserRole.ADMIN]));
  });
});
