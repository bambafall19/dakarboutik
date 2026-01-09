'use client';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuth } from '@/firebase/provider';

import type { User } from 'firebase/auth';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
