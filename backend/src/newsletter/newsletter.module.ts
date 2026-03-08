import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { NewsletterRepositoryProvider } from '../database/repository.providers';

@Module({
  controllers: [NewsletterController],
  providers: [NewsletterService, NewsletterRepositoryProvider],
  exports: [NewsletterService],
})
export class NewsletterModule {}
