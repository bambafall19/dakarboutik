
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
}

export const Logo = ({ className, onClick, imageUrl, loading, hideTextOnMobile = false }: LogoProps) => {

  if (loading) {
    return <Skeleton className="h-8 w-32" />
  }

  const content = (
    <>
      {imageUrl ? (
        <Image src={imageUrl} alt="DakarBoutik Logo" width={140} height={32} className="h-8 w-auto object-contain dark:invert" />
      ) : (
        <span className={cn(
          "text-2xl font-bold tracking-wider text-foreground",
          hideTextOnMobile && "hidden md:inline"
        )}>
          DakarBoutik
        </span>
      )}
      <span className="sr-only">DakarBoutik</span>
    </>
  );

  return (
    <Link href="/" className={cn('flex items-center gap-2', className)} onClick={onClick}>
      {content}
    </Link>
  );
};
