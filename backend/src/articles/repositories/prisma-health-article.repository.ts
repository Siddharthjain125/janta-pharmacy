import { Injectable } from '@nestjs/common';
import { HealthArticle as PrismaHealthArticle } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { HealthArticle } from '../domain';
import { IHealthArticleRepository } from './health-article-repository.interface';

@Injectable()
export class PrismaHealthArticleRepository implements IHealthArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLatest(limit: number): Promise<HealthArticle[]> {
    const articles = await this.prisma.healthArticle.findMany({
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    return articles.map((article) => this.toDomain(article));
  }

  async findBySlug(slug: string): Promise<HealthArticle | null> {
    const article = await this.prisma.healthArticle.findUnique({
      where: { slug },
    });
    return article ? this.toDomain(article) : null;
  }

  private toDomain(article: PrismaHealthArticle): HealthArticle {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      coverImage: article.coverImage,
      content: article.content,
      publishedAt: article.publishedAt,
    };
  }
}
