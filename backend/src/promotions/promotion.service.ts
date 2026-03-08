import { Inject, Injectable } from '@nestjs/common';
import { PromotionDto, toPromotionDto } from './dto';
import { IPromotionRepository, PROMOTION_REPOSITORY } from './repositories';

@Injectable()
export class PromotionService {
  constructor(
    @Inject(PROMOTION_REPOSITORY)
    private readonly promotionRepository: IPromotionRepository,
  ) {}

  async getActivePromotions(): Promise<PromotionDto[]> {
    const promotions = await this.promotionRepository.findActive(new Date());
    return promotions.map(toPromotionDto);
  }
}
