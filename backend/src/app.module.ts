import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Configuration
import appConfig from './config/app.config';
import securityConfig from './config/security.config';

// Common
import { Logger } from './common/logging/logger';
import { HealthController } from './health/health.controller';

// Database
import { DatabaseModule } from './database/database.module';

// Auth Module
import { AuthModule } from './auth/auth.module';

// Domain Modules
import { UserModule } from './user/user.module';
import { AddressModule } from './address/address.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrderModule } from './order/order.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { ConsultationModule } from './consultation/consultation.module';
import { ComplianceModule } from './compliance/compliance.module';

// Support Services
import { PaymentService } from './payment/payment.service';
import { NotificationService } from './notification/notification.service';
import { AuditService } from './audit/audit.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, securityConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database (global)
    DatabaseModule,

    // Auth Module
    AuthModule,

    // Domain Modules
    UserModule,
    AddressModule,
    CatalogModule,
    OrderModule,
    PrescriptionModule,
    ConsultationModule,
    ComplianceModule,
  ],
  controllers: [HealthController],
  providers: [
    // Common Services
    Logger,

    // Support Services (available for injection across modules)
    PaymentService,
    NotificationService,
    AuditService,
  ],
  exports: [Logger, PaymentService, NotificationService, AuditService],
})
export class AppModule {}
