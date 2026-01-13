
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Home, LayoutGrid, Search, User, Menu } from 'lucide-react';

interface MobileBottomNavProps {
    onMenuClick: () => void;
    onSearchClick: () => void;
}

export function MobileBottomNav({ onMenuClick, onSearchClick }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home },
    { action: onMenuClick, label: 'Menu', icon: Menu, isAction: true },
    { action: onSearchClick, label: 'Recherche', icon: Search, isAction: true },
    { href: '/login', label: 'Compte', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border md:hidden">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => {
          const isActive = (item.href && pathname === item.href);
          
          if (item.isAction) {
            return (
                 <button key={item.label} type="button" onClick={item.action} className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                    <item.icon className={cn("w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary")} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary">{item.label}</span>
                </button>
            )
          }

          return (
            <Link key={item.label} href={item.href || '#'} className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
              <item.icon className={cn("w-6 h-6 mb-1", isActive ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary")} />
              <span className={cn("text-xs", isActive ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
