import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // La recherche de commande par numéro a été retirée : on renvoie vers le contact
  // (WhatsApp / téléphone) qui permet désormais de commander et de suivre une commande.
  async redirects() {
    return [
      {
        source: '/suivi',
        destination: '/contact',
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
