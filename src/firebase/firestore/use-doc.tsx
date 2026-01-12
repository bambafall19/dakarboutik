'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, type DocumentReference } from 'firebase/firestore';

export function useDoc<T extends { id: string }>(ref: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const stableRefPath = useMemo(() => ref?.path, [ref]);

  useEffect(() => {
    if (ref === null) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (doc.exists()) {
          const docData = doc.data();
          const data = {
            ...docData,
            id: doc.id,
          } as T;
          setData(data);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useDoc error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableRefPath]);

  return { data, loading, error };
}
