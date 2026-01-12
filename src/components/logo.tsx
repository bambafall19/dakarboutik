
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  imageUrl?: string;
  onClick?: () => void;
}

export const Logo = ({ className, imageUrl, onClick }: LogoProps) => {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)} onClick={onClick}>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Dakar<span className="text-primary">Boutik</span>
      </span>
      <span className="sr-only">DakarBoutik</span>
    </Link>
  );
};
