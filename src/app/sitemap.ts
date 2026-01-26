import { MetadataRoute } from 'next';
import { getProducts, getCategories } from '@/lib/data-firebase';
 
const BASE_URL = 'https://dakarboutik.net';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await getProducts();
    const categories = await getCategories();

    const productUrls = products.map((product) => ({
        url: `${BASE_URL}/products/${product.slug}`,
        lastModified: new Date(product.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const categoryUrls = categories.map((category) => ({
        url: `${BASE_URL}/products?category=${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const staticUrls = [
        {
            url: `${BASE_URL}/`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/faq`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/sav`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
         {
            url: `${BASE_URL}/suivi`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
    ];

  return [
    ...staticUrls,
    ...productUrls,
    ...categoryUrls
  ];
}
