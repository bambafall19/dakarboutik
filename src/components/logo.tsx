
'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  imageUrl?: string;
}

export const Logo = ({ className, imageUrl }: LogoProps) => {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Dakarboutik Logo"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <ShoppingBag className="h-7 w-7 text-primary" />
      )}
      <span className="text-xl font-bold tracking-tight text-foreground">
        Dakarboutik
      </span>
    </Link>
  );
};
