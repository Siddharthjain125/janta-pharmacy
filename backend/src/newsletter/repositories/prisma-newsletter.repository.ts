import { Injectable } from '@nestjs/common';
import {
  NewsletterStatus as PrismaNewsletterStatus,
  NewsletterSubscriber as PrismaNewsletterSubscriber,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NewsletterStatus, NewsletterSubscriber } from '../domain';
import { INewsletterRepository } from './newsletter-repository.interface';

@Injectable()
export class PrismaNewsletterRepository implements INewsletterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<NewsletterSubscriber | null> {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });
    return subscriber ? this.toDomain(subscriber) : null;
  }

  async create(email: string): Promise<NewsletterSubscriber> {
    const subscriber = await this.prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        status: PrismaNewsletterStatus.ACTIVE,
      },
    });
    return this.toDomain(subscriber);
  }

  async updateStatus(id: string, status: NewsletterStatus): Promise<NewsletterSubscriber> {
    const subscriber = await this.prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        status: this.toPrismaStatus(status),
      },
    });
    return this.toDomain(subscriber);
  }

  private toDomain(subscriber: PrismaNewsletterSubscriber): NewsletterSubscriber {
    return {
      id: subscriber.id,
      email: subscriber.email,
      subscribedAt: subscriber.subscribedAt,
      status: this.toDomainStatus(subscriber.status),
    };
  }

  private toDomainStatus(status: PrismaNewsletterStatus): NewsletterStatus {
    return status === PrismaNewsletterStatus.ACTIVE
      ? NewsletterStatus.ACTIVE
      : NewsletterStatus.UNSUBSCRIBED;
  }

  private toPrismaStatus(status: NewsletterStatus): PrismaNewsletterStatus {
    return status === NewsletterStatus.ACTIVE
      ? PrismaNewsletterStatus.ACTIVE
      : PrismaNewsletterStatus.UNSUBSCRIBED;
  }
}
