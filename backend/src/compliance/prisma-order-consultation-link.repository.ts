import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IOrderConsultationLinkRepository } from './order-consultation-link-repository.interface';

@Injectable()
export class PrismaOrderConsultationLinkRepository
  implements IOrderConsultationLinkRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findConsultationRequestIdsByOrderId(orderId: string): Promise<string[]> {
    const links = await this.prisma.orderConsultationLink.findMany({
      where: { orderId },
      select: { consultationRequestId: true },
    });
    return links.map((l: { consultationRequestId: string }) => l.consultationRequestId);
  }

  async addLink(orderId: string, consultationRequestId: string): Promise<void> {
    await this.prisma.orderConsultationLink.create({
      data: { orderId, consultationRequestId },
    });
  }
}
