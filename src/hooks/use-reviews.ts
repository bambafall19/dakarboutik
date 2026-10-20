'use client';

import type { Review } from '@/lib/types';
import { useApiData } from './use-api-data';

export function useReviews(productId: string) {
  const { data, loading, error, refetch } = useApiData<Review[]>(
    productId ? `/api/reviews?productId=${encodeURIComponent(productId)}` : null
  );
  return { reviews: data || [], loading, error, refetch };
}
