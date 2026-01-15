
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
    return <Skeleton className="h-12 w-12 rounded-full" />
  }

  const content = (
    <>
      {imageUrl ? (
        <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
            <Image src={imageUrl} alt="DakarBoutik Logo" fill className="object-cover" />
        </div>
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
