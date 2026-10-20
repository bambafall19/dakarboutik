'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, Search, Heart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { Icons } from './icons';

interface MobileBottomNavProps {
    onMenuClick: () => void;
    onSearchClick: () => void;
}

export function MobileBottomNav({ onMenuClick, onSearchClick }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { totalItems: wishlistTotal } = useWishlist();

  const navItems = [
    { href: '/', label: 'Accueil', icon: Icons.home, isActive: pathname === '/' },
    { onClick: onMenuClick, label: 'Catégories', icon: LayoutGrid },
    { onClick: onSearchClick, label: 'Recherche', icon: Search },
    { href: '/favoris', label: 'Favoris', icon: Heart, isActive: pathname.startsWith('/favoris'), isWishlist: true },
    { href: '/checkout', label: 'Panier', icon: Icons.shoppingBag, isCart: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-background/80 backdrop-blur-lg border-t">
        <div className="container h-full">
            <div className="grid grid-cols-5 h-full items-center">
            {navItems.map((item) => {
                const isActive = item.isActive;
                const content = (
                    <div
                        className={cn(
                        'relative flex flex-col items-center justify-center transition-all duration-300 gap-1 h-full w-full',
                        !isActive && 'text-muted-foreground hover:text-primary'
                        )}
                    >
                        <div className={cn(
                            "flex items-center justify-center gap-2 h-10 px-4 rounded-full transition-all duration-300",
                            isActive ? "bg-primary text-primary-foreground" : "bg-transparent"
                        )}>
                            <item.icon className="h-6 w-6 flex-shrink-0" />
                            {isActive && <span className="text-sm font-medium">{item.label}</span>}
                        </div>

                        {item.isCart && totalItems > 0 && (
                        <span className="absolute top-2 right-1/2 translate-x-5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {totalItems}
                        </span>
                        )}
                        {item.isWishlist && wishlistTotal > 0 && (
                          <span className="absolute top-2 right-1/2 translate-x-5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
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
