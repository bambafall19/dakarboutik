import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <ShoppingBag className="h-8 w-8 text-primary" />
      <span className="text-2xl font-bold tracking-tight text-foreground">
        BeliBeli.com
      </span>
    </Link>
  );
};