import { apiClient } from './api-client';

interface NewsletterSubscribeResult {
  success: boolean;
}

export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscribeResult> {
  const response = await apiClient.post<NewsletterSubscribeResult>(
    '/newsletter/subscribe',
    { email },
    { requiresAuth: false },
  );

  return response.data ?? { success: false };
}
