'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, Heart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { Icons } from './icons';

interface MobileBottomNavProps {
    onMenuClick: () => void;
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { totalItems: wishlistTotal } = useWishlist();

  const navItems = [
    { href: '/', label: 'Accueil', icon: Icons.home, isActive: pathname === '/' },
    { onClick: onMenuClick, label: 'Catégories', icon: LayoutGrid },
    { href: '/favoris', label: 'Favoris', icon: Heart, isActive: pathname.startsWith('/favoris'), isWishlist: true },
    { href: '/checkout', label: 'Panier', icon: Icons.shoppingBag, isCart: true, isActive: pathname.startsWith('/checkout') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[calc(5rem+env(safe-area-inset-bottom))] border-t bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
        <div className="container h-20">
            <div className="grid grid-cols-4 h-full items-center">
            {navItems.map((item) => {
                const isActive = item.isActive;
                const content = (
                    <div
                        className={cn(
                        'relative flex h-full w-full flex-col items-center justify-center gap-1 transition-all duration-300',
                        !isActive && 'text-muted-foreground'
                        )}
                    >
                        <div className={cn(
                            "flex h-8 w-12 items-center justify-center rounded-full transition-all duration-300",
                            isActive ? "bg-primary text-primary-foreground" : "bg-transparent"
                        )}>
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                        </div>
                        <span className={cn(
                            "text-[10px] font-semibold leading-none",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}>
                            {item.label}
                        </span>

                        {item.isCart && totalItems > 0 && (
                        <span className="absolute right-[22%] top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                            {totalItems}
                        </span>
                        )}
                        {item.isWishlist && wishlistTotal > 0 && (
                          <span className="absolute right-[22%] top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                            {wishlistTotal}
                          </span>
                        )}
                    </div>
                );

                if (item.href) {
                    return (
                        <Link key={item.label} href={item.href} className="flex h-full items-center justify-center">
                            {content}
                        </Link>
                    )
                }

                return (
                    <button key={item.label} onClick={item.onClick} className="flex h-full w-full items-center justify-center">
                        {content}
                    </button>
                )
            })}
            </div>
      </div>
    </nav>
  );
}
