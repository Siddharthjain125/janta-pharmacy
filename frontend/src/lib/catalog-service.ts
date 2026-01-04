/**
 * Catalog Service
 *
 * API functions for fetching product catalog data.
 * All functions use the centralized API client for consistent error handling.
 */

import { apiClient } from './api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  ProductSummary,
  Category,
} from '@/types/api';

/**
 * Options for fetching products
 */
export interface FetchProductsOptions {
  page?: number;
  limit?: number;
  category?: string;
  requiresPrescription?: boolean;
}

/**
 * Fetch all active products with optional filtering
 */
export async function fetchAllProducts(
  options: FetchProductsOptions = {},
): Promise<PaginatedResponse<ProductSummary>> {
  const params = new URLSearchParams();

  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.category) params.set('category', options.category);
  if (options.requiresPrescription !== undefined) {
    params.set('requiresPrescription', String(options.requiresPrescription));
  }

  const queryString = params.toString();
  const endpoint = `/catalog/products${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<ProductSummary[]>(endpoint, {
    requiresAuth: true,
  });

  // The backend returns PaginatedResponse directly, but apiClient wraps in ApiResponse
  // We need to return the raw paginated response
  return response as unknown as PaginatedResponse<ProductSummary>;
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string): Promise<Product> {
  const response = await apiClient.get<Product>(`/catalog/products/${id}`, {
    requiresAuth: true,
  });

  if (!response.data) {
    throw new Error('Product not found');
  }

  return response.data;
}

/**
 * Search products by query
 */
export async function searchProducts(
  query: string,
  options: { page?: number; limit?: number } = {},
): Promise<PaginatedResponse<ProductSummary>> {
  const params = new URLSearchParams();
  params.set('q', query);
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));

  const endpoint = `/catalog/search?${params.toString()}`;

  const response = await apiClient.get<ProductSummary[]>(endpoint, {
    requiresAuth: true,
  });

  return response as unknown as PaginatedResponse<ProductSummary>;
}

/**
 * Fetch all product categories
 */
export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/catalog/categories', {
    requiresAuth: true,
  });

  return response.data ?? [];
}

