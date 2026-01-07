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
 *
 * Maps to backend query parameters:
 * - search → ?search=
 * - category → ?category=
 * - requiresPrescription → ?requiresPrescription=
 * - page → ?page=
 * - limit → ?limit=
 */
export interface FetchProductsOptions {
  /** Text search (searches name and description) */
  search?: string;
  /** Filter by category code (e.g., GENERAL, PRESCRIPTION) */
  category?: string;
  /** Filter by prescription requirement */
  requiresPrescription?: boolean;
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Fetch products with search, filtering, and pagination
 *
 * This is the primary function for browsing the catalog.
 * All parameters are optional - omitting them returns all active products.
 */
export async function fetchProducts(
  options: FetchProductsOptions = {},
): Promise<PaginatedResponse<ProductSummary>> {
  const params = new URLSearchParams();

  // Add search text if provided
  if (options.search?.trim()) {
    params.set('search', options.search.trim());
  }

  // Add category filter if provided
  if (options.category?.trim()) {
    params.set('category', options.category.trim());
  }

  // Add prescription filter if explicitly set
  if (options.requiresPrescription !== undefined) {
    params.set('requiresPrescription', String(options.requiresPrescription));
  }

  // Add pagination
  if (options.page && options.page > 0) {
    params.set('page', String(options.page));
  }
  if (options.limit && options.limit > 0) {
    params.set('limit', String(options.limit));
  }

  const queryString = params.toString();
  const endpoint = `/catalog/products${queryString ? `?${queryString}` : ''}`;

  // Catalog is public - no auth required for browsing
  const response = await apiClient.get<ProductSummary[]>(endpoint, {
    requiresAuth: false,
  });

  // The backend returns PaginatedResponse directly
  return response as unknown as PaginatedResponse<ProductSummary>;
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string): Promise<Product> {
  // Product details are public
  const response = await apiClient.get<Product>(`/catalog/products/${id}`, {
    requiresAuth: false,
  });

  if (!response.data) {
    throw new Error('Product not found');
  }

  return response.data;
}

/**
 * Fetch all product categories
 */
export async function fetchCategories(): Promise<Category[]> {
  // Categories are public
  const response = await apiClient.get<Category[]>('/catalog/categories', {
    requiresAuth: false,
  });

  return response.data ?? [];
}

// Legacy alias for backward compatibility
export const fetchAllProducts = fetchProducts;
