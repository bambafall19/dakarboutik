import Link from 'next/link';
import { Logo } from './logo';
import { Separator } from './ui/separator';

const footerLinks = [
  { name: 'À propos', href: '#' },
  { name: 'Contact', href: '#' },
  { name: 'Politique de retour', href: '#' },
  { name: 'CGV', href: '#' },
];

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm">
              Votre destination pour l'électronique de qualité à Dakar.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
            <div>
              <h4 className="font-semibold text-foreground">Boutique</h4>
              <nav className="mt-4 flex flex-col gap-2 text-sm">
                <Link href="/products?category=smartphones" className="hover:text-primary">Smartphones</Link>
                <Link href="/products?category=audio" className="hover:text-primary">Audio</Link>
                <Link href="/products?category=accessoires" className="hover:text-primary">Accessoires</Link>
                <Link href="/products?category=pc-portables" className="hover:text-primary">PC & Portables</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Support</h4>
              <nav className="mt-4 flex flex-col gap-2 text-sm">
                {footerLinks.map(link => (
                  <Link key={link.name} href={link.href} className="hover:text-primary">{link.name}</Link>
                ))}
              </nav>
            </div>
             <div>
              <h4 className="font-semibold text-foreground">Légal</h4>
              <nav className="mt-4 flex flex-col gap-2 text-sm">
                 <Link href="#" className="hover:text-primary">Politique de confidentialité</Link>
                 <Link href="#" className="hover:text-primary">Conditions d'utilisation</Link>
              </nav>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center text-sm">
          © {new Date().getFullYear()} Dakarboutik. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
