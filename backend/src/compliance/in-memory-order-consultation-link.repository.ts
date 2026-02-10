import { Injectable } from '@nestjs/common';
import { IOrderConsultationLinkRepository } from './order-consultation-link-repository.interface';

@Injectable()
export class InMemoryOrderConsultationLinkRepository
  implements IOrderConsultationLinkRepository
{
  private readonly links: Map<string, Set<string>> = new Map(); // orderId -> Set<consultationRequestId>

  async findConsultationRequestIdsByOrderId(orderId: string): Promise<string[]> {
    const set = this.links.get(orderId);
    return set ? Array.from(set) : [];
  }

  async addLink(orderId: string, consultationRequestId: string): Promise<void> {
    let set = this.links.get(orderId);
    if (!set) {
      set = new Set();
      this.links.set(orderId, set);
    }
    set.add(consultationRequestId);
  }
}
