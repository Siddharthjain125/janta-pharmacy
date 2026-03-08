import { Inject, Injectable } from '@nestjs/common';
import { NewsletterStatus } from './domain';
import { NEWSLETTER_REPOSITORY, INewsletterRepository } from './repositories';
import { NewsletterAlreadySubscribedException } from './exceptions';
import { NewsletterSubscriberDto, toNewsletterSubscriberDto } from './dto';

@Injectable()
export class NewsletterService {
  constructor(
    @Inject(NEWSLETTER_REPOSITORY)
    private readonly newsletterRepository: INewsletterRepository,
  ) {}

  async subscribe(email: string): Promise<NewsletterSubscriberDto> {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.newsletterRepository.findByEmail(normalizedEmail);

    if (existing && existing.status === NewsletterStatus.ACTIVE) {
      throw new NewsletterAlreadySubscribedException(normalizedEmail);
    }

    if (existing && existing.status === NewsletterStatus.UNSUBSCRIBED) {
      const reactivated = await this.newsletterRepository.updateStatus(
        existing.id,
        NewsletterStatus.ACTIVE,
      );
      return toNewsletterSubscriberDto(reactivated);
    }

    const subscriber = await this.newsletterRepository.create(normalizedEmail);
    return toNewsletterSubscriberDto(subscriber);
  }
}
