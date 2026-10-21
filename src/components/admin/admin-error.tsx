'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function AdminError({
  title = 'Une erreur est survenue',
  description = 'Impossible de charger les données. Vérifiez votre connexion puis réessayez.',
  onRetry,
}: AdminErrorProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </span>
        <h2 className="mt-4 font-headline text-xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-6 rounded-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        )}
      </div>
    </div>
  );
}
