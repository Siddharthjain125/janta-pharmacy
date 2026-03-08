import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { HealthArticleRepositoryProvider } from '../database/repository.providers';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService, HealthArticleRepositoryProvider],
  exports: [ArticleService],
})
export class ArticleModule {}
