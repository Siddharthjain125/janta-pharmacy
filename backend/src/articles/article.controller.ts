import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse } from '../common/api/api-response';
import { ArticleService } from './article.service';
import { HealthArticleDto, HealthArticleSummaryDto } from './dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async list(
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<HealthArticleSummaryDto[]>> {
    const parsedLimit = limit ? Math.max(1, parseInt(limit, 10) || 3) : 3;
    const articles = await this.articleService.listLatest(parsedLimit);
    return ApiResponse.success(articles, 'Articles retrieved successfully');
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string): Promise<ApiResponse<HealthArticleDto>> {
    const article = await this.articleService.getBySlug(slug);
    return ApiResponse.success(article, 'Article retrieved successfully');
  }
}
