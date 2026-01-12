'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-provider';
import { FirebaseClientProvider } from '@/firebase';
import { AppShell } from '@/components/app-shell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr-SN" className="h-full">
      <head>
        <title>Dakarboutik - Électronique de pointe à Dakar</title>
        <meta
          name="description"
          content="Votre boutique en ligne pour les smartphones, accessoires, audio, et PC à Dakar. Qualité et service client garantis."
        />
      </head>
      <body
        className={cn(
          'relative h-full bg-background font-body antialiased',
          inter.className
        )}
      >
        <FirebaseClientProvider>
          <CartProvider>
            <AppShell>{children}</AppShell>
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
