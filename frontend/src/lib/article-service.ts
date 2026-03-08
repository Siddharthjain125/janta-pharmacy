import { apiClient } from './api-client';
import type { HealthArticle, HealthArticleSummary } from '@/types/api';

export async function fetchArticles(limit = 3): Promise<HealthArticleSummary[]> {
  const response = await apiClient.get<HealthArticleSummary[]>(`/articles?limit=${limit}`, {
    requiresAuth: false,
  });
  return response.data ?? [];
}

export async function fetchArticleBySlug(slug: string): Promise<HealthArticle> {
  const response = await apiClient.get<HealthArticle>(`/articles/${slug}`, {
    requiresAuth: false,
  });
  if (!response.data) {
    throw new Error('Article not found');
  }
  return response.data;
}
