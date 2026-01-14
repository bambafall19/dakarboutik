
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Home, LayoutGrid, Search, ShoppingBag, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { CartDrawer } from './cart-drawer';
import { useCart } from '@/hooks/use-cart';

interface MobileBottomNavProps {
    onMenuClick: () => void;
    onSearchClick: () => void;
}

const NavItem = ({ href, label, icon: Icon, isActive, onClick }: { href?: string, label: string, icon: React.ElementType, isActive?: boolean, onClick?: () => void }) => {
    const content = (
        <div className={cn(
            "flex items-center justify-center h-12 transition-all duration-300 ease-in-out",
            isActive ? "bg-primary text-primary-foreground rounded-full px-4 gap-2" : "w-12"
        )}>
            <Icon className="h-6 w-6" />
            {isActive && <span className="text-sm font-medium">{label}</span>}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="flex-1 flex justify-center items-center">
                {content}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} className="flex-1 flex justify-center items-center">
            {content}
        </button>
    );
};


export function MobileBottomNav({ onMenuClick, onSearchClick }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home, isActive: pathname === '/' },
    { onClick: onMenuClick, label: 'Catégories', icon: LayoutGrid },
    { onClick: onSearchClick, label: 'Recherche', icon: Search },
    { isCart: true, label: 'Panier', icon: ShoppingBag },
  ]

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm md:hidden">
      <div className="bg-background/80 backdrop-blur-lg border rounded-full shadow-lg flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => {
            if (item.isCart) {
                return (
                    <Sheet key={index}>
                        <SheetTrigger asChild>
                            <button className="flex-1 flex justify-center items-center h-12 w-12 relative">
                                <ShoppingBag className="w-6 h-6 text-foreground" />
                                {totalItems > 0 && (
                                    <span className="absolute top-0 right-0 text-xs w-5 h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        </SheetTrigger>
                        <SheetContent className="flex flex-col">
                            <CartDrawer />
                        </SheetContent>
                    </Sheet>
                )
            }
            return (
                 <NavItem 
                    key={index}
                    href={item.href} 
                    label={item.label} 
                    icon={item.icon}
                    isActive={item.isActive}
                    onClick={item.onClick}
                />
            )
        })}
      </div>
    </div>
  );
}
