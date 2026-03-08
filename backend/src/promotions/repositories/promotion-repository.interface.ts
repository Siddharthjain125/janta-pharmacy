import { Promotion } from '../domain';

export const PROMOTION_REPOSITORY = Symbol('PROMOTION_REPOSITORY');

export interface IPromotionRepository {
  findActive(now: Date): Promise<Promotion[]>;
}
