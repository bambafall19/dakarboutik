'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, type Query } from 'firebase/firestore';

export function useCollection<T extends { id: string }>(q: Query | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const stableQueryKey = useMemo(() => {
    if (!q) return null;
    // A stable key for the query to use in useEffect dependencies
    // @ts-ignore
    return `${q.path}-${JSON.stringify(q._query?.filters || [])}`;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableQueryKey]);

  return { data, loading, error };
}
