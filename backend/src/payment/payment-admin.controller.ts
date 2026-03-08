import {
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiResponse } from '../common/api/api-response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/interfaces/auth-user.interface';
import { PaymentIntentService } from './payment-intent.service';
import { toPaymentIntentResponseDto } from './dto/payment-response.dto';

/**
 * Payment Admin Controller (Phase 6)
 *
 * GET /api/v1/admin/payments/pending
 * POST /api/v1/admin/payments/:id/verify
 * POST /api/v1/admin/payments/:id/reject
 */
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PaymentAdminController {
  constructor(private readonly paymentIntentService: PaymentIntentService) {}

  @Get('pending')
  async getPending(): Promise<ApiResponse<ReturnType<typeof toPaymentIntentResponseDto>[]>> {
    const list = await this.paymentIntentService.listPending();
    return ApiResponse.success(
      list.map(toPaymentIntentResponseDto),
      'Pending payments retrieved successfully',
    );
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @Param('id') id: string,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<ReturnType<typeof toPaymentIntentResponseDto>>> {
    const intent = await this.paymentIntentService.verify(id, correlationId);
    return ApiResponse.success(toPaymentIntentResponseDto(intent), 'Payment verified successfully');
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Headers('x-correlation-id') correlationId: string,
  ): Promise<ApiResponse<ReturnType<typeof toPaymentIntentResponseDto>>> {
    const intent = await this.paymentIntentService.reject(id, correlationId);
    return ApiResponse.success(toPaymentIntentResponseDto(intent), 'Payment rejected');
  }
}
