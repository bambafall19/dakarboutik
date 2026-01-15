
import Link from 'next/link';
import { Logo } from './logo';
import { Separator } from './ui/separator';
import type { SiteSettings } from '@/lib/types';
import { Icons } from './icons';
import { Input } from './ui/input';
import { Button } from './ui/button';

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
    { name: 'Garantie & SAV', href: '/sav' },
    { name: 'Politique de retour', href: '#' },
    { name: 'CGV', href: '#' },
  ],
  'Mon Compte': [
     { name: 'Connexion', href: '/login' },
     { name: 'Panier', href: '/checkout' },
     { name: 'Liste de souhaits', href: '#' },
  ]
};

interface FooterProps {
  settings?: SiteSettings | null;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-card text-card-foreground border-t mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <div className='flex justify-start'>
                <Logo imageUrl={settings?.logoUrl} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Votre destination 100% sénégalaise pour l'électronique de qualité à Dakar.
            </p>
            <div className="mt-4 flex gap-4">
                <Icons.whatsapp className="h-6 w-6" />
                {/* Social media icons here */}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:col-span-5 text-left">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="font-semibold text-foreground mb-4">{title}</h4>
                <nav className="flex flex-col gap-2 text-sm">
                  {links.map(link => (
                    <Link key={link.name} href={link.href} className="text-muted-foreground hover:text-primary">{link.name}</Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
          <div className="md:col-span-3">
              <h4 className="font-semibold text-foreground mb-4">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-4">Abonnez-vous pour recevoir les dernières offres.</p>
              <form className="flex gap-2">
                <Input type="email" placeholder="Votre email" />
                <Button type="submit">S'inscrire</Button>
              </form>
          </div>
        </div>
        <Separator className="my-8 bg-border/50" />
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} DakarBoutik. Une entreprise fièrement sénégalaise.
        </div>
      </div>
    </footer>
  );
}
