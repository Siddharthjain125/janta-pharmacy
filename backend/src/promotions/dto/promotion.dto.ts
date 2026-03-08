import { Promotion } from '../domain';

export interface PromotionDto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  discountPercent: number;
  expiresAt: string;
}

export function toPromotionDto(promotion: Promotion): PromotionDto {
  return {
    id: promotion.id,
    title: promotion.title,
    description: promotion.description,
    imageUrl: promotion.imageUrl,
    discountPercent: promotion.discountPercent,
    expiresAt: promotion.expiresAt.toISOString(),
  };
}
