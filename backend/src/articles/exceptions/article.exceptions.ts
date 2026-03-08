import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/business.exception';

export class ArticleNotFoundException extends BusinessException {
  constructor(slug: string) {
    super('ARTICLE_NOT_FOUND', `Health article not found: ${slug}`, HttpStatus.NOT_FOUND);
  }
}
