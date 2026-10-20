'use client';

import { Lexend, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-provider';
import { AuthProvider } from '@/lib/auth-context';
import { AppShell } from '@/components/app-shell';
import { ThemeProvider } from '@/components/theme-provider';
import { WishlistProvider } from '@/context/wishlist-provider';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SnowProvider } from '@/context/snow-provider';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-lexend',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { toast } = useToast();

  useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: 'Action non autorisée',
        description: 'Le contenu de ce site est protégé.',
      });
    };
    document.addEventListener('contextmenu', handleContextmenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextmenu);
    };
  }, [toast]);
  
  return (
    <html lang="fr-SN" className="h-full" suppressHydrationWarning>
      <head>
        <title>DakarBoutik - Électronique & Smartphones au Sénégal</title>
        <meta
          name="description"
          content="Votre boutique en ligne de référence pour les smartphones, accessoires, audio, et PC à Dakar. Qualité, service client et livraison rapide garantis."
        />
        <meta property="og:title" content="DakarBoutik - Électronique & Smartphones au Sénégal" />
        <meta property="og:description" content="Votre boutique en ligne de référence pour les smartphones, accessoires, audio, et PC à Dakar. Qualité, service client et livraison rapide garantis." />
        <meta property="og:image" content="https://dakarboutik.net/logo.svg" />
        <meta property="og:url" content="https://dakarboutik.net" />
        <meta property="og:type" content="website" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.svg" sizes="any" type="image/svg+xml" />
        <link rel="mask-icon" href="/logo.svg" color="#0B6E4F" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B6E4F" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <meta name="apple-mobile-web-app-status-bar" content="#0B6E4F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={cn(
          'relative h-full font-body antialiased',
          lexend.variable,
          jakarta.variable
        )}
      >
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N2FPSJ7P');`}
        </Script>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N2FPSJ7P"
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
          <AuthProvider>
            <SnowProvider>
              <WishlistProvider>
                <CartProvider>
                  <AppShell>{children}</AppShell>
                  <Toaster />
                </CartProvider>
              </WishlistProvider>
            </SnowProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
