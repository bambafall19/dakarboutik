
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ShoppingBasket } from 'lucide-react';

interface LogoProps {
  className?: string;
  onClick?: () => void;
  imageUrl?: string | null;
}

export const Logo = ({ className, onClick, imageUrl }: LogoProps) => {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)} onClick={onClick}>
      {imageUrl ? (
        <Image src={imageUrl} alt="Dakarboutik Logo" width={32} height={32} className="h-8 w-auto rounded-sm object-contain" />
      ) : (
        <ShoppingBasket className="h-6 w-6 text-primary" />
      )}
      <span className="text-xl font-bold tracking-tight text-foreground">
        Dakar<span className="text-primary">Boutik</span>
      </span>
      <span className="sr-only">DakarBoutik</span>
    </Link>
  );
};
