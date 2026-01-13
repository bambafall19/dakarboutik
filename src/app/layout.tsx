
'use client';

import Script from 'next/script';
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
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NGD258WC');
          `}
        </Script>
        <title>DakarBoutik</title>
        <meta
          name="description"
          content="Votre boutique en ligne pour les smartphones, accessoires, audio, et PC à Dakar. Qualité et service client garantis."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-status-bar" content="#ffffff" />
      </head>
      <body
        className={cn(
          'relative h-full bg-background font-body antialiased',
          inter.className
        )}
      >
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NGD258WC"
        height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>
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
