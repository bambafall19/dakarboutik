'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';
import { resourceFromUrl, subscribeDataChange } from '@/lib/data-events';

const POLL_INTERVAL = 15000;

export function useApiData<T>(url: string | null, deps: any[] = [], initialData?: T | null) {
  const hasSeed = initialData !== undefined && initialData !== null;
  const seedRef = useRef(hasSeed);

  const [data, setData] = useState<T | null>(hasSeed ? (initialData as T) : null);
  const [loading, setLoading] = useState(!hasSeed);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  const resource = url ? resourceFromUrl(url) : null;

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
     
  }, [url]);

  useEffect(() => {
    mounted.current = true;
    if (!seedRef.current) setLoading(true);
    load();
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      load();
    }, POLL_INTERVAL);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  useEffect(() => {
    if (!url || !resource) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = subscribeDataChange((event) => {
      if (event.resource !== resource && event.resource !== '*') return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        load();
      }, 60);
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [url, resource, load]);

  return { data, loading, error, refetch: load };
}
