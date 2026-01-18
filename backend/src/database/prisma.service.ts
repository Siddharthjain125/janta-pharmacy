import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Service
 *
 * Wraps PrismaClient and handles lifecycle.
 * Gracefully handles missing DATABASE_URL for development.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private client: PrismaClient | null = null;
  private _isConnected = false;

  get isConnected(): boolean {
    return this._isConnected;
  }

  async onModuleInit(): Promise<void> {
    if (!process.env.DATABASE_URL) {
      this.logger.warn(
        'DATABASE_URL not set. Database features disabled. ' +
          'Create backend/.env with DATABASE_URL to enable.',
      );
      return;
    }

    try {
      this.client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
      await this.client.$connect();
      this._isConnected = true;
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      this.client = null;
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.$disconnect();
    }
  }

  /**
   * Get the Prisma client instance
   * Throws if database is not connected
   */
  getClient(): PrismaClient {
    if (!this.client) {
      throw new Error('Database is not connected. Set DATABASE_URL in .env');
    }
    return this.client;
  }

  // ==========================================================================
  // Proxy common Prisma properties for convenience
  // ==========================================================================

  get user() {
    return this.getClient().user;
  }

  get credential() {
    return this.getClient().credential;
  }

  get refreshToken() {
    return this.getClient().refreshToken;
  }

  get order() {
    return this.getClient().order;
  }

  get orderItem() {
    return this.getClient().orderItem;
  }

  get product() {
    return this.getClient().product;
  }
}
