import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { ApiResponse } from '../common/api/api-response';

/**
 * Prescription Controller
 *
 * Exposes REST endpoints for prescription management.
 * All endpoints return placeholder responses.
 */
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  /**
   * Get all prescriptions with pagination
   */
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ): Promise<ApiResponse<unknown>> {
    const prescriptions = await this.prescriptionService.findAll(page, limit, status);
    return ApiResponse.success(prescriptions, 'Prescriptions retrieved successfully');
  }

  /**
   * Get prescription by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<unknown>> {
    const prescription = await this.prescriptionService.findById(id);
    return ApiResponse.success(prescription, 'Prescription retrieved successfully');
  }

  /**
   * Get prescriptions by user ID
   */
  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<ApiResponse<unknown>> {
    const prescriptions = await this.prescriptionService.findByUserId(userId, page, limit);
    return ApiResponse.success(prescriptions, 'User prescriptions retrieved successfully');
  }

  /**
   * Upload a new prescription
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPrescriptionDto: unknown): Promise<ApiResponse<unknown>> {
    const prescription = await this.prescriptionService.create(createPrescriptionDto);
    return ApiResponse.success(prescription, 'Prescription uploaded successfully');
  }

  /**
   * Verify prescription (admin only)
   */
  @Put(':id/verify')
  async verify(@Param('id') id: string, @Body() verifyDto: unknown): Promise<ApiResponse<unknown>> {
    const prescription = await this.prescriptionService.verify(id, verifyDto);
    return ApiResponse.success(prescription, 'Prescription verified successfully');
  }

  /**
   * Reject prescription (admin only)
   */
  @Put(':id/reject')
  async reject(@Param('id') id: string, @Body() rejectDto: unknown): Promise<ApiResponse<unknown>> {
    const prescription = await this.prescriptionService.reject(id, rejectDto);
    return ApiResponse.success(prescription, 'Prescription rejected');
  }

  /**
   * Link prescription to order
   */
  @Post(':id/link-order')
  async linkToOrder(
    @Param('id') id: string,
    @Body() linkDto: unknown,
  ): Promise<ApiResponse<unknown>> {
    const result = await this.prescriptionService.linkToOrder(id, linkDto);
    return ApiResponse.success(result, 'Prescription linked to order successfully');
  }
}
