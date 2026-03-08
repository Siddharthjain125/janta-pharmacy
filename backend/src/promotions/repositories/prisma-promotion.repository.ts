import { Injectable } from '@nestjs/common';
import { Promotion as PrismaPromotion } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { Promotion } from '../domain';
import { IPromotionRepository } from './promotion-repository.interface';

@Injectable()
export class PrismaPromotionRepository implements IPromotionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(now: Date): Promise<Promotion[]> {
    const promotions = await this.prisma.promotion.findMany({
      where: {
        active: true,
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: 'asc' },
    });

    return promotions.map((promotion) => this.toDomain(promotion));
  }

  private toDomain(promotion: PrismaPromotion): Promotion {
    return {
      id: promotion.id,
      title: promotion.title,
      description: promotion.description,
      imageUrl: promotion.imageUrl,
      discountPercent: promotion.discountPercent,
      active: promotion.active,
      expiresAt: promotion.expiresAt,
    };
  }
}
