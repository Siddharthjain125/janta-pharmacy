import { HealthArticle } from '../domain';

export interface HealthArticleSummaryDto {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  publishedAt: string;
}

export interface HealthArticleDto extends HealthArticleSummaryDto {
  content: string;
}

export function toHealthArticleSummaryDto(article: HealthArticle): HealthArticleSummaryDto {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    coverImage: article.coverImage,
    publishedAt: article.publishedAt.toISOString(),
  };
}

export function toHealthArticleDto(article: HealthArticle): HealthArticleDto {
  return {
    ...toHealthArticleSummaryDto(article),
    content: article.content,
  };
}
