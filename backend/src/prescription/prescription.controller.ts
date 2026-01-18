import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '../common/api/api-response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/interfaces/auth-user.interface';
import { PrescriptionDto, RejectPrescriptionDto, SubmitPrescriptionDto } from './dto';
import { SubmitPrescriptionUseCase } from './use-cases/submit-prescription.use-case';
import { GetMyPrescriptionsUseCase } from './use-cases/get-my-prescriptions.use-case';
import { GetPendingPrescriptionsUseCase } from './use-cases/get-pending-prescriptions.use-case';
import { ReviewPrescriptionUseCase } from './use-cases/review-prescription.use-case';

/**
 * Prescription Controller (User)
 */
@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionController {
  constructor(
    private readonly submitPrescriptionUseCase: SubmitPrescriptionUseCase,
    private readonly getMyPrescriptionsUseCase: GetMyPrescriptionsUseCase,
  ) {}

  /**
   * Submit a prescription
   * POST /api/v1/prescriptions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submit(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitPrescriptionDto,
  ): Promise<ApiResponse<PrescriptionDto>> {
    const prescription = await this.submitPrescriptionUseCase.execute(userId, dto);
    return ApiResponse.success(prescription, 'Prescription submitted successfully');
  }

  /**
   * List my prescriptions
   * GET /api/v1/prescriptions
   */
  @Get()
  async getMyPrescriptions(
    @CurrentUser('id') userId: string,
  ): Promise<ApiResponse<PrescriptionDto[]>> {
    const prescriptions = await this.getMyPrescriptionsUseCase.execute(userId);
    return ApiResponse.success(prescriptions, 'Prescriptions retrieved successfully');
  }
}

/**
 * Prescription Admin Controller
 */
@Controller('admin/prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PrescriptionAdminController {
  constructor(
    private readonly getPendingPrescriptionsUseCase: GetPendingPrescriptionsUseCase,
    private readonly reviewPrescriptionUseCase: ReviewPrescriptionUseCase,
  ) {}

  /**
   * List pending prescriptions
   * GET /api/v1/admin/prescriptions/pending
   */
  @Get('pending')
  async getPending(): Promise<ApiResponse<PrescriptionDto[]>> {
    const prescriptions = await this.getPendingPrescriptionsUseCase.execute();
    return ApiResponse.success(prescriptions, 'Pending prescriptions retrieved successfully');
  }

  /**
   * Approve prescription
   * POST /api/v1/admin/prescriptions/:id/approve
   */
  @Post(':id/approve')
  async approve(@Param('id') id: string): Promise<ApiResponse<PrescriptionDto>> {
    const prescription = await this.reviewPrescriptionUseCase.execute(id, 'APPROVE');
    return ApiResponse.success(prescription, 'Prescription approved successfully');
  }

  /**
   * Reject prescription
   * POST /api/v1/admin/prescriptions/:id/reject
   */
  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectPrescriptionDto,
  ): Promise<ApiResponse<PrescriptionDto>> {
    const prescription = await this.reviewPrescriptionUseCase.execute(
      id,
      'REJECT',
      dto.rejectionReason,
    );
    return ApiResponse.success(prescription, 'Prescription rejected');
  }
}
