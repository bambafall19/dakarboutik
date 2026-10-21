'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeDataChange } from '@/lib/data-events';

export function DataRefreshBridge() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeDataChange(() => {
      router.refresh();
    });
    return unsubscribe;
  }, [router]);

  return null;
}
