'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function ContextMenuGuard() {
  const { toast } = useToast();

  useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: 'Action non autorisée',
        description: 'Le contenu de ce site est protégé.',
      });
    };
    document.addEventListener('contextmenu', handleContextmenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextmenu);
    };
  }, [toast]);

  return null;
}
