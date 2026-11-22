'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, Heart, Store, UserRound, Ellipsis } from 'lucide-react';
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
    { href: '/boutiques', label: 'Boutiques', icon: Store, isActive: pathname.startsWith('/boutiques'), isWishlist: false },
    { href: '/commercant', label: 'Mon compte', icon: UserRound, isActive: pathname.startsWith('/commercant') },
    { onClick: onMenuClick, label: 'Plus', icon: Ellipsis, isCart: false, isActive: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[calc(5rem+env(safe-area-inset-bottom))] rounded-t-3xl border-t border-amber-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
        <div className="container h-20">
            <div className="grid grid-cols-5 h-full items-center">
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
                            "text-xs font-semibold leading-tight text-center px-1",
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
                    <button type="button" key={item.label} onClick={item.onClick} className="flex h-full w-full items-center justify-center">
                        {content}
                    </button>
                )
            })}
            </div>
      </div>
    </nav>
  );
}
