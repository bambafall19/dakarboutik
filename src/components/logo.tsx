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
    return <Skeleton className="h-10 w-32" />
  }

  const content = (
    <>
      {imageUrl ? (
        <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden">
            <Image src={imageUrl} alt="DakarBoutik Logo" fill className="object-cover" />
        </div>
      ) : null}
      <span className={cn(
          "text-xl tracking-wider text-foreground font-dynapuff md:font-body md:font-bold",
          hideTextOnMobile && "hidden sm:inline-block"
        )}>
          DakarBoutik
        </span>
      <span className="sr-only">DakarBoutik</span>
    </>
  );

  return (
    <Link href="/" className={cn('flex items-center gap-2', className)} onClick={onClick}>
      {content}
    </Link>
  );
};
