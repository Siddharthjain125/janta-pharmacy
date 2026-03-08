import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

// User repositories
import { USER_REPOSITORY } from '../user/repositories/user-repository.interface';
import { InMemoryUserRepository } from '../user/repositories/in-memory-user.repository';
import { PrismaUserRepository } from '../user/repositories/prisma-user.repository';

// Address repositories
import { ADDRESS_REPOSITORY } from '../address/repositories/address-repository.interface';
import { InMemoryAddressRepository } from '../address/repositories/in-memory-address.repository';
import { PrismaAddressRepository } from '../address/repositories/prisma-address.repository';

// Prescription repositories
import { PRESCRIPTION_REPOSITORY } from '../prescription/repositories/prescription-repository.interface';
import { InMemoryPrescriptionRepository } from '../prescription/repositories/in-memory-prescription.repository';
import { PrismaPrescriptionRepository } from '../prescription/repositories/prisma-prescription.repository';

// Order repositories
import { ORDER_REPOSITORY } from '../order/repositories/order-repository.interface';
import { InMemoryOrderRepository } from '../order/repositories/in-memory-order.repository';
import { PrismaOrderRepository } from '../order/repositories/prisma-order.repository';

// Product repositories
import { PRODUCT_REPOSITORY } from '../catalog/repositories/product-repository.interface';
import { InMemoryProductRepository } from '../catalog/repositories/in-memory-product.repository';
import { PrismaProductRepository } from '../catalog/repositories/prisma-product.repository';

// Payment intent repositories (Phase 6)
import { PAYMENT_INTENT_REPOSITORY } from '../payment/repositories/payment-intent-repository.interface';
import { InMemoryPaymentIntentRepository } from '../payment/repositories/in-memory-payment-intent.repository';
import { PrismaPaymentIntentRepository } from '../payment/repositories/prisma-payment-intent.repository';

// Newsletter repositories
import { NEWSLETTER_REPOSITORY } from '../newsletter/repositories/newsletter-repository.interface';
import { InMemoryNewsletterRepository } from '../newsletter/repositories/in-memory-newsletter.repository';
import { PrismaNewsletterRepository } from '../newsletter/repositories/prisma-newsletter.repository';

// Promotion repositories
import { PROMOTION_REPOSITORY } from '../promotions/repositories/promotion-repository.interface';
import { InMemoryPromotionRepository } from '../promotions/repositories/in-memory-promotion.repository';
import { PrismaPromotionRepository } from '../promotions/repositories/prisma-promotion.repository';

// Health article repositories
import { HEALTH_ARTICLE_REPOSITORY } from '../articles/repositories/health-article-repository.interface';
import { InMemoryHealthArticleRepository } from '../articles/repositories/in-memory-health-article.repository';
import { PrismaHealthArticleRepository } from '../articles/repositories/prisma-health-article.repository';

/**
 * Repository Type Configuration
 *
 * Determines which repository implementation to use:
 * - 'memory': In-memory repositories (for tests, development without DB)
 * - 'prisma': Prisma/PostgreSQL repositories (for production, development with DB)
 *
 * Strategy:
 * 1. If REPOSITORY_TYPE is explicitly set, use that
 * 2. Otherwise, use 'prisma' if DATABASE_URL is set, 'memory' if not
 */
export type RepositoryType = 'memory' | 'prisma';

/**
 * Determine the repository type from environment
 */
export function getRepositoryType(): RepositoryType {
  const explicitType = process.env.REPOSITORY_TYPE;

  if (explicitType === 'memory' || explicitType === 'prisma') {
    return explicitType;
  }

  // Auto-detect based on DATABASE_URL
  return process.env.DATABASE_URL ? 'prisma' : 'memory';
}

/**
 * Check if using Prisma repositories
 */
export function isPrismaEnabled(): boolean {
  return getRepositoryType() === 'prisma';
}

// =============================================================================
// User Repository Provider
// =============================================================================

export const UserRepositoryProvider: Provider = {
  provide: USER_REPOSITORY,
  useFactory: (prismaService: PrismaService) => {
    if (isPrismaEnabled()) {
      return new PrismaUserRepository(prismaService);
    }
    return new InMemoryUserRepository();
  },
  inject: [PrismaService],
};

// =============================================================================
// Address Repository Provider
// =============================================================================

export const AddressRepositoryProvider: Provider = {
  provide: ADDRESS_REPOSITORY,
  useFactory: (prismaService: PrismaService) => {
    if (isPrismaEnabled()) {
      return new PrismaAddressRepository(prismaService);
    }
    return new InMemoryAddressRepository();
  },
  inject: [PrismaService],
};

// =============================================================================
// Prescription Repository Provider
// =============================================================================

export const PrescriptionRepositoryProvider: Provider = {
  provide: PRESCRIPTION_REPOSITORY,
  useFactory: (prismaService: PrismaService) => {
    if (isPrismaEnabled()) {
      return new PrismaPrescriptionRepository(prismaService);
    }
    return new InMemoryPrescriptionRepository();
  },
  inject: [PrismaService],
};

// =============================================================================
// Order Repository Provider
// =============================================================================

export const OrderRepositoryProvider: Provider = {
  provide: ORDER_REPOSITORY,
  useFactory: (prismaService: PrismaService) => {
    if (isPrismaEnabled()) {
      return new PrismaOrderRepository(prismaService);
    }
    return new InMemoryOrderRepository();
  },
  inject: [PrismaService],
};

// =============================================================================
// Product Repository Provider
// =============================================================================

export const ProductRepositoryProvider: Provider = {
  provide: PRODUCT_REPOSITORY,
  useFactory: (prismaService: PrismaService) => {
    if (isPrismaEnabled()) {
      return new PrismaProductRepository(prismaService);
    }
    return new InMemoryProductRepository();
  },
  inject: [PrismaService],
};

// =============================================================================
// Payment Intent Repository Provider (Phase 6)
// =============================================================================

export const PaymentIntentRepositoryProvider: Provider = {
  provide: PAYMENT_INTENT_REPOSITORY,
  useFactory: (prismaService: PrismaService) => {
    if (isPrismaEnabled()) {
      return new PrismaPaymentIntentRepository(prismaService);
    }
    return new InMemoryPaymentIntentRepository();
  },
  inject: [PrismaService],
};

// =============================================================================
// Newsletter Repository Provider
// =============================================================================

export const NewsletterRepositoryProvider: Provider = {
  provide: NEWSLETTER_REPOSITORY,
  useFactory: (prismaService: PrismaService) => {
    if (isPrismaEnabled()) {
      return new PrismaNewsletterRepository(prismaService);
    }
    return new InMemoryNewsletterRepository();
  },
  inject: [PrismaService],
};

// =============================================================================
// Promotion Repository Provider
// =============================================================================

export const PromotionRepositoryProvider: Provider = {
  provide: PROMOTION_REPOSITORY,
  useFactory: (prismaService: PrismaService) => {
    if (isPrismaEnabled()) {
      return new PrismaPromotionRepository(prismaService);
    }
    return new InMemoryPromotionRepository();
  },
  inject: [PrismaService],
};

// =============================================================================
// Health Article Repository Provider
// =============================================================================

export const HealthArticleRepositoryProvider: Provider = {
  provide: HEALTH_ARTICLE_REPOSITORY,
  useFactory: (prismaService: PrismaService) => {
    if (isPrismaEnabled()) {
      return new PrismaHealthArticleRepository(prismaService);
    }
    return new InMemoryHealthArticleRepository();
  },
  inject: [PrismaService],
};
