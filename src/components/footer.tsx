
import Link from 'next/link';
import { Logo } from './logo';
import { Separator } from './ui/separator';
import type { SiteSettings } from '@/lib/types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


const footerLinks = {
  Boutique: [
    { name: 'Smartphones', href: '/products?category=telephonie' },
    { name: 'Audio', href: '/products?category=audio' },
    { name: 'Accessoires', href: '/products?category=accessoires' },
    { name: 'PC & Portables', href: '/products?category=informatique' },
  ],
  Support: [
    { name: 'À propos', href: '/a-propos' },
    { name: 'Contact', href: '/contact' },
    { name: 'Garantie & SAV', href: '/sav' },
    { name: 'Suivi de Commande', href: '/suivi' },
    { name: 'FAQ', href: '/faq' },
  ],
  'Mon Compte': [
     { name: 'Connexion', href: '/login' },
     { name: 'Panier', href: '/checkout' },
     { name: 'Favoris', href: '/favoris' },
  ]
};

interface FooterProps {
  settings?: SiteSettings | null;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-card text-card-foreground border-t mt-16">
      <div className="container pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4">
            <div className='flex justify-start mb-4'>
                <Logo imageUrl={settings?.logoUrl} />
            </div>
            <p className="text-sm text-muted-foreground">
              Votre destination 100% sénégalaise pour l'électronique de qualité à Dakar.
            </p>
             <div className="mt-4 flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><Youtube className="h-5 w-5" /></Link>
            </div>
          </div>
          
          <div className="lg:col-span-5 md:pl-8">
            {/* Desktop Links */}
            <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 gap-8 text-left">
              {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title}>
                  <h4 className="font-semibold text-foreground mb-4">{title}</h4>
                  <nav className="flex flex-col gap-2.5 text-sm">
                    {links.map(link => (
                      <Link key={link.name} href={link.href} className="text-muted-foreground hover:text-primary transition-colors">{link.name}</Link>
                    ))}
                  </nav>
                </div>
              ))}
            </div>

            {/* Mobile Accordion Links */}
            <div className='md:hidden'>
              <Accordion type="multiple" className="w-full">
                {Object.entries(footerLinks).map(([title, links]) => (
                  <AccordionItem value={title} key={title}>
                    <AccordionTrigger className='py-3 text-base font-semibold'>{title}</AccordionTrigger>
                    <AccordionContent>
                      <nav className="flex flex-col gap-3 pl-4">
                        {links.map(link => (
                          <Link key={link.name} href={link.href} className="text-muted-foreground hover:text-primary transition-colors py-1">{link.name}</Link>
                        ))}
                      </nav>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
          
          <div className="lg:col-span-3">
              <h4 className="font-semibold text-foreground mb-4">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-4">Abonnez-vous pour recevoir les dernières offres.</p>
              <form className="flex gap-2">
                <Input type="email" placeholder="Votre email" className="bg-background"/>
                <Button type="submit">S'inscrire</Button>
              </form>
          </div>
        </div>
        <Separator className="my-8 bg-border/50" />
        <div className="flex flex-col md:flex-row justify-between items-center text-center text-sm text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} DakarBoutik. Une entreprise fièrement sénégalaise.</p>
          <div className='flex items-center gap-4'>
             <Link href="/conditions-generales" className="hover:text-primary">Conditions générales</Link>
             <Link href="/politique-de-confidentialite" className="hover:text-primary">Politique de confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
