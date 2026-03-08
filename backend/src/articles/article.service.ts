import { Inject, Injectable } from '@nestjs/common';
import { ArticleNotFoundException } from './exceptions';
import {
  HEALTH_ARTICLE_REPOSITORY,
  IHealthArticleRepository,
} from './repositories';
import {
  HealthArticleDto,
  HealthArticleSummaryDto,
  toHealthArticleDto,
  toHealthArticleSummaryDto,
} from './dto';

@Injectable()
export class ArticleService {
  constructor(
    @Inject(HEALTH_ARTICLE_REPOSITORY)
    private readonly articleRepository: IHealthArticleRepository,
  ) {}

  async listLatest(limit = 3): Promise<HealthArticleSummaryDto[]> {
    const articles = await this.articleRepository.findLatest(limit);
    return articles.map(toHealthArticleSummaryDto);
  }

  async getBySlug(slug: string): Promise<HealthArticleDto> {
    const article = await this.articleRepository.findBySlug(slug);
    if (!article) {
      throw new ArticleNotFoundException(slug);
    }
    return toHealthArticleDto(article);
  }
}
