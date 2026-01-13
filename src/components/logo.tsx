
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
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

  return (
    <Link href="/" className={cn('flex items-center gap-2', className)} onClick={onClick}>
      {imageUrl ? (
        <Image src={imageUrl} alt="Dakarboutik Logo" width={32} height={32} className="h-8 w-auto rounded-sm object-contain" />
      ) : (
        <ShoppingCart className="h-8 w-8 text-primary" />
      )}
      <span className={cn(
        "text-2xl font-bold tracking-tight text-foreground",
        hideTextOnMobile && "hidden sm:inline"
      )}>
        Shopcart
      </span>
      <span className="sr-only">Shopcart</span>
    </Link>
  );
};
