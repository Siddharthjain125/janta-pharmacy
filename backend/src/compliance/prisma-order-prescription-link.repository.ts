import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IOrderPrescriptionLinkRepository } from './order-prescription-link-repository.interface';

@Injectable()
export class PrismaOrderPrescriptionLinkRepository implements IOrderPrescriptionLinkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPrescriptionIdsByOrderId(orderId: string): Promise<string[]> {
    const links = await this.prisma.orderPrescriptionLink.findMany({
      where: { orderId },
      select: { prescriptionId: true },
    });
    return links.map((l: { prescriptionId: string }) => l.prescriptionId);
  }

  async addLink(orderId: string, prescriptionId: string): Promise<void> {
    await this.prisma.orderPrescriptionLink.create({
      data: { orderId, prescriptionId },
    });
  }
}
