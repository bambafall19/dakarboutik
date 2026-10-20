'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-8 w-8" />
      </span>

      <h1 className="font-headline text-2xl font-extrabold tracking-tight md:text-3xl">
        Une erreur est survenue
      </h1>
      <p className="mt-3 max-w-md text-balance text-sm text-muted-foreground md:text-base">
        Désolé, quelque chose s&apos;est mal passé de notre côté. Réessayez ou
        revenez à l&apos;accueil.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          size="lg"
          className="rounded-full bg-primary px-6 hover:bg-primary/90"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full px-6">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Accueil
          </Link>
        </Button>
      </div>
    </div>
  );
}
