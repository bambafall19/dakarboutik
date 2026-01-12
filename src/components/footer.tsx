
import Link from 'next/link';
import { Logo } from './logo';
import { Separator } from './ui/separator';
import type { SiteSettings } from '@/lib/types';

const footerLinks = {
  Boutique: [
    { name: 'Smartphones', href: '/products?category=smartphones' },
    { name: 'Audio', href: '/products?category=audio' },
    { name: 'Accessoires', href: '/products?category=accessoires' },
    { name: 'PC & Portables', href: '/products?category=pc-portables' },
  ],
  Support: [
    { name: 'À propos', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Politique de retour', href: '#' },
    { name: 'CGV', href: '#' },
  ],
  Légal: [
    { name: 'Politique de confidentialité', href: '#' },
    { name: 'Conditions d\'utilisation', href: '#' },
  ],
};

interface FooterProps {
  settings?: SiteSettings | null;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo imageUrl={settings?.logoUrl} />
            <p className="mt-4 text-sm text-foreground">
              Votre destination 100% sénégalaise pour l'électronique de qualité à Dakar.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="font-semibold text-foreground">{title}</h4>
                <nav className="mt-4 flex flex-col gap-2 text-sm">
                  {links.map(link => (
                    <Link key={link.name} href={link.href} className="text-foreground hover:text-primary">{link.name}</Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
        <Separator className="my-8 bg-border/50" />
        <div className="text-center text-sm text-foreground">
          © {new Date().getFullYear()} DakarBoutik. Une entreprise fièrement sénégalaise.
        </div>
      </div>
    </footer>
  );
}
