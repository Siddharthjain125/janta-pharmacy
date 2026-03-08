import { Module } from '@nestjs/common';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';
import { PromotionRepositoryProvider } from '../database/repository.providers';

@Module({
  controllers: [PromotionController],
  providers: [PromotionService, PromotionRepositoryProvider],
  exports: [PromotionService],
})
export class PromotionModule {}
