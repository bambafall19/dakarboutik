
import type {NextConfig} from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

const pwaConfig = {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
}

// Disable PWA in development with Turbopack, as it's not compatible.
const isDevWithTurbo = process.env.NODE_ENV === 'development' && process.env.TURBOPACK;

export default isDevWithTurbo ? nextConfig : withPWA(pwaConfig)(nextConfig);
