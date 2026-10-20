import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
        {
            userAgent: '*',
            allow: '/',
            disallow: '/admin/',
        },
        {
            userAgent: 'GPTBot',
            disallow: '/',
        },
        {
            userAgent: 'Google-Extended',
            disallow: '/',
        }
    ],
    sitemap: 'https://dakarboutik.net/sitemap.xml',
  };
}
