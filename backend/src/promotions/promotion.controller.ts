import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '../common/api/api-response';
import { PromotionService } from './promotion.service';
import { PromotionDto } from './dto';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get()
  async getPromotions(): Promise<ApiResponse<PromotionDto[]>> {
    const promotions = await this.promotionService.getActivePromotions();
    return ApiResponse.success(promotions, 'Promotions retrieved successfully');
  }
}
