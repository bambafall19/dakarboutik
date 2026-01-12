
import Link from 'next/link';
import { getCategories } from '@/lib/data';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import { findImage } from '@/lib/placeholder-images';

const categoryImages = {
    'telephonie': 'product-phone-1a',
    'informatique': 'product-laptop-1a',
    'audio': 'product-headphones-1a',
    'accessoires': 'product-cable-1a',
};


export function FeaturedCategories() {
  const categories = getCategories();

  // We only want to feature top-level categories here
  const featured = categories;

  return (
    <div>
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Catégories</h2>
            <p className="mt-2 text-foreground">Parcourez nos univers de produits.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((category) => {
            const imageId = categoryImages[category.slug as keyof typeof categoryImages] || 'product-phone-1a';
            const image = findImage(imageId);

            return (
              <Link key={category.id} href={`/products?category=${category.slug}`} className="group block">
                  <Card className="overflow-hidden">
                      <CardContent className="p-0 relative aspect-square">
                          <Image 
                              src={image.imageUrl}
                              alt={category.name}
                              data-ai-hint={image.imageHint}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
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
