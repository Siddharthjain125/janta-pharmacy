import { Injectable } from '@nestjs/common';
import { Promotion } from '../domain';
import { IPromotionRepository } from './promotion-repository.interface';

@Injectable()
export class InMemoryPromotionRepository implements IPromotionRepository {
  private readonly promotions: Promotion[] = [
    {
      id: 'promo-1',
      title: '20% off on vitamins',
      description: 'Save more on daily wellness essentials this week.',
      imageUrl: '/assets/promotions/vitamins.svg',
      discountPercent: 20,
      active: true,
      expiresAt: new Date('2099-12-31T00:00:00.000Z'),
    },
  ];

  async findActive(now: Date): Promise<Promotion[]> {
    return this.promotions.filter((promotion) => promotion.active && promotion.expiresAt > now);
  }
}
