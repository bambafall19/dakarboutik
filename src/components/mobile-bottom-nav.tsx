
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, LayoutGrid, User } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Icons } from './icons';

interface MobileBottomNavProps {
    onMenuClick: () => void;
    onSearchClick: () => void;
}

export function MobileBottomNav({ onMenuClick, onSearchClick }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home, isActive: pathname === '/' },
    { onClick: onMenuClick, label: 'Catégories', icon: LayoutGrid },
    { href: '/checkout', label: 'Panier', icon: Icons.shoppingBag, isCart: true },
    { href: '/login', label: 'Compte', icon: User, isActive: pathname === '/login' },
  ]

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
      <div className="relative grid grid-cols-4 h-16 items-center justify-around rounded-full bg-card shadow-lg border">
        {navItems.map((item) => {
            const content = (
                 <div
                    className={cn(
                      'relative flex h-full w-full items-center justify-center transition-colors duration-300',
                      item.isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                >
                    <div
                        className={cn(
                            'flex items-center gap-2 rounded-full p-2 transition-all duration-300',
                            item.isActive && 'bg-muted px-4'
                        )}
                    >
                        <item.icon className="h-6 w-6 flex-shrink-0" />
                        {item.isActive && <span className="text-sm font-medium">{item.label}</span>}
                    </div>

                    {item.isCart && totalItems > 0 && (
                      <span className="absolute top-1 right-1/2 translate-x-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {totalItems}
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
                <button key={item.label} onClick={item.onClick} className="flex h-full items-center justify-center">
                    {content}
                </button>
            )
        })}
      </div>
    </div>
  );
}
