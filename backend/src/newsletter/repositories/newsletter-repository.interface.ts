import { NewsletterSubscriber, NewsletterStatus } from '../domain';

export const NEWSLETTER_REPOSITORY = Symbol('NEWSLETTER_REPOSITORY');

export interface INewsletterRepository {
  findByEmail(email: string): Promise<NewsletterSubscriber | null>;
  create(email: string): Promise<NewsletterSubscriber>;
  updateStatus(id: string, status: NewsletterStatus): Promise<NewsletterSubscriber>;
}
