'use client';

import { Ubuntu } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-provider';
import { FirebaseClientProvider } from '@/firebase';
import { AppShell } from '@/components/app-shell';
import { ThemeProvider } from '@/components/theme-provider';

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-ubuntu',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr-SN" className="h-full" suppressHydrationWarning>
      <head>
        <title>DakarBoutik</title>
        <meta
          name="description"
          content="Votre boutique en ligne pour les smartphones, accessoires, audio, et PC à Dakar. Qualité et service client garantis."
        />
        <meta name="google-site-verification" content="x5-0ni_P2U8uwEMRdmy9O8qV-yZdb6luVOdC1KwjLQ0" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="https://storage.googleapis.com/studioprod-52595.appspot.com/dakarboutik/logo.png?v=2" sizes="any" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#112D55" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-status-bar" content="#112D55" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={cn(
          'relative h-full font-body antialiased',
          ubuntu.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <CartProvider>
              <AppShell>{children}</AppShell>
              <Toaster />
            </CartProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
