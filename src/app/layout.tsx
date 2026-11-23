import type { Metadata } from 'next';
import { SiteAnalytics } from '@/components/site-analytics';
import { Lexend, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-provider';
import { AuthProvider } from '@/lib/auth-context';
import AppShellServer from '@/components/app-shell-server';
import { ThemeProvider } from '@/components/theme-provider';
import { WishlistProvider } from '@/context/wishlist-provider';
import { SnowProvider } from '@/context/snow-provider';
import { DataRefreshBridge } from '@/components/data-refresh-bridge';
import { ContextMenuGuard } from '@/components/context-menu-guard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL('https://dakarboutik.net'),
  title: 'DakarBoutik — Vos envies. Nos boutiques.',
  description: 'Solaire, informatique et parfumerie : découvrez les produits de nos boutiques partenaires et contactez directement votre vendeur.',
  openGraph: {
    title: 'DakarBoutik — Vos envies. Nos boutiques.',
    description: 'Découvrez les produits de nos boutiques partenaires : solaire, informatique et parfumerie.',
    url: 'https://dakarboutik.net/',
    siteName: 'DakarBoutik',
    type: 'website',
    locale: 'fr_SN',
    images: [{ url: '/dakarboutik-partage-whatsapp-20261123.jpg', width: 1254, height: 1254, type: 'image/jpeg', alt: 'DakarBoutik — Vos envies. Nos boutiques. Solaire, informatique et parfumerie.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DakarBoutik — Vos envies. Nos boutiques.',
    description: 'Découvrez nos boutiques partenaires et contactez directement votre vendeur.',
    images: ['/dakarboutik-partage-whatsapp-20261123.jpg'],
  },
};


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
  return (
    <html lang="fr-SN" className="h-full" suppressHydrationWarning>
      <head>

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/dakarboutik-logo-tricolore.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B6E4F" />
        <link rel="apple-touch-icon" href="/dakarboutik-logo-tricolore.png" />
        <meta name="apple-mobile-web-app-status-bar" content="#0B6E4F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        suppressHydrationWarning
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
                  <AppShellServer>{children}</AppShellServer>
                  <DataRefreshBridge />
                  <SiteAnalytics />
                  <Toaster />
                  <ContextMenuGuard />
                </CartProvider>
              </WishlistProvider>
            </SnowProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
