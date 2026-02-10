import { Injectable } from '@nestjs/common';
import { IOrderPrescriptionLinkRepository } from './order-prescription-link-repository.interface';

@Injectable()
export class InMemoryOrderPrescriptionLinkRepository implements IOrderPrescriptionLinkRepository {
  private readonly links: Map<string, Set<string>> = new Map(); // orderId -> Set<prescriptionId>

  async findPrescriptionIdsByOrderId(orderId: string): Promise<string[]> {
    const set = this.links.get(orderId);
    return set ? Array.from(set) : [];
  }

  async addLink(orderId: string, prescriptionId: string): Promise<void> {
    let set = this.links.get(orderId);
    if (!set) {
      set = new Set();
      this.links.set(orderId, set);
    }
    set.add(prescriptionId);
  }
}
