import Link from 'next/link';
import { Logo } from './logo';
import { Separator } from './ui/separator';

const footerLinks = {
  BeliBeli: [
    { name: 'About BeliBeli', href: '#' },
    { name: 'BeliBeli Care', href: '#' },
  ],
  Buy: [
    { name: 'Bill & Top up', href: '#' },
    { name: 'BeliBeli COD', href: '#' },
  ],
  Sell: [
    { name: 'Sell on BeliBeli', href: '#' },
    { name: 'Seller Education Center', href: '#' },
    { name: 'Brand Index', href: '#' },
  ],
  'Guide and Help': [
    { name: 'Term and Condition', href: '#' },
    { name: 'Privacy', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t mt-16">
      <div className="container py-12">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-bold">"Let's Shop Beyond Boundaries"</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Redefine Your Everyday Style
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground">{title}</h4>
              <nav className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                {links.map(link => (
                  <Link key={link.name} href={link.href} className="hover:text-primary">{link.name}</Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} BeliBeli.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
}