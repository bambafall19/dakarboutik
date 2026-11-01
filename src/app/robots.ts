import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
        {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/commercant', '/api/', '/login'],
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
