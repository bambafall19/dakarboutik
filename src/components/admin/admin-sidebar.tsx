'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LineChart,
  Settings,
  Image as ImageIcon,
  Boxes,
  Tags,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const menuItems: any[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/banners', label: 'Bannières', icon: ImageIcon },
  {
    label: 'Produits',
    icon: Package,
    subItems: [
      { href: '/admin/products', label: 'Tous les produits', icon: Boxes },
      { href: '/admin/add-product', label: 'Ajouter un produit', icon: Plus },
      { href: '/admin/categories', label: 'Catégories', icon: Tags },
    ],
  },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/admin/faq', label: 'FAQ', icon: HelpCircle },
  { hrefExternal: 'https://analytics.google.com/', label: 'Statistiques', icon: LineChart },
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
      return (
        item.subItems.some((sub: any) => pathname.startsWith(sub.href)) ||
        pathname.startsWith('/admin/edit-product')
      );
    }
    return false;
  };

  const defaultActiveAccordion = menuItems.find(
    (item) =>
      item.subItems &&
      (item.subItems.some((sub: any) => pathname.startsWith(sub.href)) ||
        pathname.startsWith('/admin/edit-product'))
  )?.label;

  return (
    <div className="hidden bg-nav text-nav-foreground lg:block">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-600 font-headline text-base font-extrabold text-primary-foreground ring-2 ring-accent/60">
            D
          </span>
          <div className="leading-tight">
            <span className="block font-headline text-sm font-extrabold">
              Dakar<span className="text-accent">Boutik</span>
            </span>
            <span className="text-[11px] text-nav-foreground/60">Espace Admin</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid items-start gap-1 px-3 text-sm font-medium">
            <Accordion
              type="multiple"
              defaultValue={defaultActiveAccordion ? [defaultActiveAccordion] : []}
            >
              {menuItems.map((item) =>
                item.subItems ? (
                  <AccordionItem key={item.label} value={item.label} className="border-b-0">
                    <AccordionTrigger
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-nav-foreground/70 transition-all hover:bg-white/10 hover:text-nav-foreground hover:no-underline',
                        isLinkActive(item) && 'bg-white/10 text-nav-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </AccordionTrigger>
                    <AccordionContent className="pl-9">
                      <nav className="grid gap-1 pt-1">
                        {item.subItems.map((subItem: any) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-nav-foreground/60 transition-all hover:bg-white/5 hover:text-nav-foreground',
                              pathname === subItem.href && 'bg-accent/15 text-accent'
                            )}
                          >
                            <subItem.icon className="h-4 w-4" />
                            {subItem.label}
                          </Link>
                        ))}
                      </nav>
                    </AccordionContent>
                  </AccordionItem>
                ) : item.hrefExternal ? (
                  <a
                    key={item.label}
                    href={item.hrefExternal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-nav-foreground/70 transition-all hover:bg-white/10 hover:text-nav-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-nav-foreground/70 transition-all hover:bg-white/10 hover:text-nav-foreground',
                      isLinkActive(item) && 'bg-white/10 text-nav-foreground'
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
