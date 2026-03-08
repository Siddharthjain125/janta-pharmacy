import { IsEmail } from 'class-validator';
import { NewsletterSubscriber } from '../domain';

export class SubscribeNewsletterDto {
  @IsEmail()
  email: string;
}

export interface NewsletterSubscriberDto {
  id: string;
  email: string;
  subscribedAt: string;
  status: string;
}

export interface NewsletterSubscribeResponseDto {
  success: boolean;
}

export function toNewsletterSubscriberDto(
  subscriber: NewsletterSubscriber,
): NewsletterSubscriberDto {
  return {
    id: subscriber.id,
    email: subscriber.email,
    subscribedAt: subscriber.subscribedAt.toISOString(),
    status: subscriber.status,
  };
}
