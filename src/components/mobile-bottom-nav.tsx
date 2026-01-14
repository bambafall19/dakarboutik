
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Home, LayoutGrid, Search, ShoppingBag } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { CartDrawer } from './cart-drawer';
import { useCart } from '@/hooks/use-cart';

interface MobileBottomNavProps {
    onMenuClick: () => void;
    onSearchClick: () => void;
}

const NavItem = ({ href, label, icon: Icon, isActive, onClick }: { href?: string, label: string, icon: React.ElementType, isActive?: boolean, onClick?: () => void }) => {
    const content = (
        <>
            <Icon className={cn("w-6 h-6 mb-1", isActive ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary")} />
            <span className={cn("text-xs", isActive ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary")}>{label}</span>
        </>
    );

    if (href) {
        return (
            <Link href={href} className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group h-full">
                {content}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group h-full">
            {content}
        </button>
    );
}


export function MobileBottomNav({ onMenuClick, onSearchClick }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border md:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        <NavItem 
            href="/" 
            label="Accueil" 
            icon={Home} 
            isActive={pathname === '/'}
        />
        <NavItem 
            onClick={onMenuClick} 
            label="Catégories" 
            icon={LayoutGrid} 
        />
        <NavItem 
            onClick={onSearchClick} 
            label="Recherche" 
            icon={Search} 
        />
        <Sheet>
            <SheetTrigger asChild>
                <button type="button" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group h-full relative">
                    <ShoppingBag className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary">Panier</span>
                    {totalItems > 0 && (
                        <span className="absolute top-1 right-3 text-xs w-5 h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                            {totalItems}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
                <CartDrawer />
            </SheetContent>
        </Sheet>
         <div className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group h-full">
            <ThemeToggle />
         </div>
      </div>
    </div>
  );
}
