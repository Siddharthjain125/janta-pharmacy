import { apiClient } from './api-client';
import type { Promotion } from '@/types/api';

export async function fetchPromotions(): Promise<Promotion[]> {
  const response = await apiClient.get<Promotion[]>('/promotions', {
    requiresAuth: false,
  });
  return response.data ?? [];
}
