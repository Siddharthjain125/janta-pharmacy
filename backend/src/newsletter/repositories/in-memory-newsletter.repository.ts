import { Injectable } from '@nestjs/common';
import { NewsletterStatus, NewsletterSubscriber } from '../domain';
import { INewsletterRepository } from './newsletter-repository.interface';

@Injectable()
export class InMemoryNewsletterRepository implements INewsletterRepository {
  private readonly subscribers = new Map<string, NewsletterSubscriber>();

  async findByEmail(email: string): Promise<NewsletterSubscriber | null> {
    const normalized = email.toLowerCase();
    for (const subscriber of this.subscribers.values()) {
      if (subscriber.email === normalized) {
        return subscriber;
      }
    }
    return null;
  }

  async create(email: string): Promise<NewsletterSubscriber> {
    const now = new Date();
    const subscriber: NewsletterSubscriber = {
      id: `newsletter-${this.subscribers.size + 1}`,
      email: email.toLowerCase(),
      status: NewsletterStatus.ACTIVE,
      subscribedAt: now,
    };
    this.subscribers.set(subscriber.id, subscriber);
    return subscriber;
  }

  async updateStatus(id: string, status: NewsletterStatus): Promise<NewsletterSubscriber> {
    const existing = this.subscribers.get(id);
    if (!existing) {
      throw new Error(`Subscriber not found: ${id}`);
    }

    const updated: NewsletterSubscriber = {
      ...existing,
      status,
    };
    this.subscribers.set(id, updated);
    return updated;
  }
}
