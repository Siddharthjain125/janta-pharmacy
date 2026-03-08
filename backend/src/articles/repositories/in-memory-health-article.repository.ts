import { Injectable } from '@nestjs/common';
import { HealthArticle } from '../domain';
import { IHealthArticleRepository } from './health-article-repository.interface';

@Injectable()
export class InMemoryHealthArticleRepository implements IHealthArticleRepository {
  private readonly articles: HealthArticle[] = [
    {
      id: 'article-1',
      title: 'How to manage diabetes',
      slug: 'how-to-manage-diabetes',
      summary: 'Simple daily habits to keep blood sugar levels in range.',
      coverImage: '/assets/articles/diabetes-care.svg',
      content: '# How to manage diabetes\n\nMaintain a healthy diet and stay active.',
      publishedAt: new Date('2026-01-15T10:00:00.000Z'),
    },
  ];

  async findLatest(limit: number): Promise<HealthArticle[]> {
    return [...this.articles]
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  async findBySlug(slug: string): Promise<HealthArticle | null> {
    return this.articles.find((article) => article.slug === slug) ?? null;
  }
}
