
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  Settings,
  Image as ImageIcon,
  ChevronRight,
  Boxes,
  Tags,
  Library,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/banners', label: 'Bannières', icon: ImageIcon },
  {
    label: 'Produits',
    icon: Package,
    subItems: [
      { href: '/admin/products', label: 'Tous les produits', icon: Boxes },
      { href: '/admin/add-product', label: 'Ajouter un produit', icon: Boxes },
      { href: '/admin/categories', label: 'Catégories', icon: Tags },
    ],
    basePath: '/admin/products',
  },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '#', label: 'Clients', icon: Users },
  { href: '#', label: 'Rapports', icon: LineChart },
  { href: '/admin/settings', label: 'Réglages', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isLinkActive = (item: (typeof menuItems)[number]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    if (item.href) {
      return pathname.startsWith(item.href);
    }
    if (item.subItems) {
      return item.subItems.some(sub => pathname.startsWith(sub.href)) || pathname.startsWith('/admin/edit-product');
    }
    return false;
  };
  
  const defaultActiveAccordion = menuItems.find(item => item.subItems && (item.subItems.some(sub => pathname.startsWith(sub.href)) || pathname.startsWith('/admin/edit-product')))?.label;


  return (
    <div className="hidden border-r bg-card lg:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Logo />
            <span className="">Admin</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start px-4 text-sm font-medium">
            <Accordion type="multiple" defaultValue={defaultActiveAccordion ? [defaultActiveAccordion] : []}>
              {menuItems.map((item) =>
                item.subItems ? (
                  <AccordionItem key={item.label} value={item.label} className="border-b-0">
                     <AccordionTrigger className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline", isLinkActive(item) && 'text-primary bg-muted')}>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                     </AccordionTrigger>
                     <AccordionContent className="pl-8">
                       <nav className="grid gap-1">
                          {item.subItems.map(subItem => (
                            <Link
                              key={subItem.label}
                              href={subItem.href}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                pathname === subItem.href && 'text-primary'
                              )}
                            >
                              <subItem.icon className="h-4 w-4" />
                              {subItem.label}
                            </Link>
                          ))}
                       </nav>
                     </AccordionContent>
                  </AccordionItem>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                      isLinkActive(item) && 'bg-muted text-primary'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              )}
            </Accordion>
          </nav>
        </div>
      </div>
    </div>
  );
}
