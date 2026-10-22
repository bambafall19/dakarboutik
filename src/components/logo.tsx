'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

interface LogoProps {
  className?: string;
  onClick?: () => void;
  imageUrl?: string | null;
  loading?: boolean;
  hideTextOnMobile?: boolean;
  inverted?: boolean;
}

export const Logo = ({ className, onClick, imageUrl, loading, hideTextOnMobile = false, inverted = false }: LogoProps) => {
  if (loading) {
    return <Skeleton className="h-10 w-32" />;
  }

  return (
    <Link
      href="/"
      className={cn('group flex items-center gap-2.5', className)}
      onClick={onClick}
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-2 ring-accent/60 ring-offset-2 ring-offset-background transition group-hover:ring-accent">
        <Image
          src={imageUrl || '/logo.svg'}
          alt="DakarBoutik Logo"
          fill
          sizes="40px"
          className="object-contain"
          priority
        />
      </div>
      <span
        className={cn(
          'font-headline text-xl font-extrabold tracking-tight',
          inverted ? 'text-nav-foreground' : 'text-foreground',
          hideTextOnMobile && 'hidden sm:inline-block'
        )}
      >
        Dakar<span className={inverted ? 'text-accent' : 'text-primary'}>Boutik</span>
      </span>
      <span className="sr-only">DakarBoutik</span>
    </Link>
  );
};
