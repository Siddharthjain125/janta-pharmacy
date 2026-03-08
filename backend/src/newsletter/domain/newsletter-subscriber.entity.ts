import { NewsletterStatus } from './newsletter-status';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: Date;
  status: NewsletterStatus;
}
