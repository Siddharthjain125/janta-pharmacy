import { Module } from '@nestjs/common';
import { CONSULTATION_REQUEST_REPOSITORY } from './repositories/consultation-request-repository.interface';
import { InMemoryConsultationRequestRepository } from './repositories/in-memory-consultation-request.repository';
import { PrismaConsultationRequestRepository } from './repositories/prisma-consultation-request.repository';
import { PrismaService } from '../database/prisma.service';
import { getRepositoryType } from '../database/repository.providers';

@Module({
  providers: [
    {
      provide: CONSULTATION_REQUEST_REPOSITORY,
      useFactory: (prisma: PrismaService) => {
        if (getRepositoryType() === 'prisma') {
          return new PrismaConsultationRequestRepository(prisma);
        }
        return new InMemoryConsultationRequestRepository();
      },
      inject: [PrismaService],
    },
  ],
  exports: [CONSULTATION_REQUEST_REPOSITORY],
})
export class ConsultationModule {}
