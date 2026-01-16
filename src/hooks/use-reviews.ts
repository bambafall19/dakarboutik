
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import type { Review } from '@/lib/types';

export function useReviews(productId: string) {
  const firestore = useFirestore();

  const reviewsQuery = useMemo(() => {
    if (!firestore || !productId) return null;
    return query(collection(firestore, `products/${productId}/reviews`), orderBy('createdAt', 'desc'));
  }, [firestore, productId]);

  const { data: reviews, loading, error } = useCollection<Review>(reviewsQuery);

  return { reviews: reviews || [], loading, error };
}
