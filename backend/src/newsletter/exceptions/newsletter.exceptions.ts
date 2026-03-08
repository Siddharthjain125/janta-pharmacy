import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/business.exception';

export class NewsletterAlreadySubscribedException extends BusinessException {
  constructor(email: string) {
    super(
      'NEWSLETTER_ALREADY_SUBSCRIBED',
      `Email is already subscribed: ${email}`,
      HttpStatus.CONFLICT,
    );
  }
}
