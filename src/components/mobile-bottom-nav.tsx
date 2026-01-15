
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Home, LayoutGrid, Search, ShoppingCart, User } from 'lucide-react';

interface MobileBottomNavProps {
    onMenuClick: () => void;
    onSearchClick: () => void;
}

export function MobileBottomNav({ onMenuClick, onSearchClick }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home, isActive: pathname === '/' },
    { onClick: onMenuClick, label: 'Catégories', icon: LayoutGrid },
    { onClick: onSearchClick, label: 'Recherche', icon: Search },
    { href: '/login', label: 'Compte', icon: User, isActive: pathname === '/login' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-lg">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
            const content = (
                 <div
                    className={cn(
                    'flex flex-col items-center gap-1 text-xs text-muted-foreground',
                    item.isActive && 'text-primary'
                    )}
                >
                    <item.icon className="h-6 w-6" />
                    <span>{item.label}</span>
                </div>
            );

            if (item.href) {
                 return (
                    <Link key={item.label} href={item.href} className="flex-1 flex justify-center">
                        {content}
                    </Link>
                 )
            }

            return (
                <button key={item.label} onClick={item.onClick} className="flex-1 flex justify-center">
                    {content}
                </button>
            )
        })}
      </div>
    </div>
  );
}
