'use client';

import { Ubuntu, DynaPuff } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-provider';
import { FirebaseClientProvider } from '@/firebase';
import { AppShell } from '@/components/app-shell';
import { ThemeProvider } from '@/components/theme-provider';
import { WishlistProvider } from '@/context/wishlist-provider';
import { useEffect } from 'react';

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-ubuntu',
});

const dynaPuff = DynaPuff({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dynapuff',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextmenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextmenu);
    };
  }, []);
  
  return (
    <html lang="fr-SN" className="h-full" suppressHydrationWarning>
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
        <meta name="google-site-verification" content="KFsMq_Wa2CFdELHtlc2fH1m9MiyOpvThvdC1kc9BqTk" />
        
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="https://storage.googleapis.com/studioprod-52595.appspot.com/dakarboutik/logo.png?v=2" sizes="any" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#112D55" />
        <link rel="apple-touch-icon" href="https://storage.googleapis.com/studioprod-52595.appspot.com/dakarboutik/logo.png?v=2" />
        <meta name="apple-mobile-web-app-status-bar" content="#112D55" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={cn(
          'relative h-full font-body antialiased',
          ubuntu.variable,
          dynaPuff.variable
        )}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NGD258WC"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <WishlistProvider>
              <CartProvider>
                <AppShell>{children}</AppShell>
                <Toaster />
              </CartProvider>
            </WishlistProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
