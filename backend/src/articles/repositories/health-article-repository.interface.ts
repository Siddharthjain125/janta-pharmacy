import { HealthArticle } from '../domain';

export const HEALTH_ARTICLE_REPOSITORY = Symbol('HEALTH_ARTICLE_REPOSITORY');

export interface IHealthArticleRepository {
  findLatest(limit: number): Promise<HealthArticle[]>;
  findBySlug(slug: string): Promise<HealthArticle | null>;
}
