'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, type Query } from 'firebase/firestore';

export function useCollection<T extends { id: string }>(q: Query | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // By memoizing the query, we can use it as a dependency in useEffect.
  // We stringify the query's internal _query object to create a stable key.
  const memoizedQuery = useMemo(() => {
    if (!q) return null;
    try {
      // This is a way to get a stable, string representation of the query
      return JSON.stringify((q as any)._query);
    } catch {
      // Fallback for safety, though it's less reliable
      return String(q);
    }
  }, [q]);

  useEffect(() => {
    if (q === null) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            ...docData,
            id: doc.id,
          } as T;
        });
        setData(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useCollection error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery, q]);

  return { data, loading, error };
}
