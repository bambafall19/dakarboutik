
'use client';

import Link from 'next/link';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import { findImage } from '@/lib/placeholder-images';
import { useCategories } from '@/hooks/use-site-data';
import { Skeleton } from './ui/skeleton';

const categoryImages: { [key: string]: string } = {
    'telephonie': 'product-phone-1a',
    'informatique': 'product-laptop-1a',
    'audio': 'product-headphones-1a',
    'accessoires': 'product-cable-1a',
};


export function FeaturedCategories() {
  const { categories, loading } = useCategories();

  // Suggestion: Manually select the top 4 categories to feature.
  const featuredSlugs = ['telephonie', 'informatique', 'audio', 'accessoires'];
  const featured = categories.filter(c => featuredSlugs.includes(c.slug));
  
  if (loading) {
    return (
        <div className="container px-4 md:px-8 py-8 md:py-16">
             <div className="text-center mb-8 md:mb-12">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto mt-2" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                ))}
            </div>
        </div>
    )
  }
  
  if (featured.length === 0) {
    return null;
  }

  return (
    <div className="container px-4 md:px-8 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold tracking-tight">Catégories</h2>
            <p className="mt-2 text-muted-foreground">Parcourez nos univers de produits.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((category) => {
            const imageId = categoryImages[category.slug] || 'product-phone-1a';
            const image = findImage(imageId);

            return (
              <Link key={category.id} href={`/products?category=${category.slug}`} className="group block">
                  <Card className="overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-0 relative aspect-square">
                          <Image 
                              src={image.imageUrl}
                              alt={category.name}
                              data-ai-hint={image.imageHint}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <h3 className="font-bold text-xl text-white text-center drop-shadow-md">{category.name}</h3>
                          </div>
                      </CardContent>
                  </Card>
              </Link>
            );
          })}
        </div>
    </div>
  );
}
