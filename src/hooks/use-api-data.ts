'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';

const POLL_INTERVAL = 15000;

export function useApiData<T>(url: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get<T>(url);
      if (mounted.current) {
        setData(res);
        setError(null);
      }
    } catch (e: any) {
      if (mounted.current) setError(e);
    } finally {
      if (mounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    load();
    const id = setInterval(load, POLL_INTERVAL);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  return { data, loading, error, refetch: load };
}
