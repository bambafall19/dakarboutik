import Link from 'next/link';
import Image from 'next/image';
import { findImage } from '@/lib/placeholder-images';
import type { Category } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

const categoryImages: { [key: string]: string } = {
  telephonie: 'product-phone-1a',
  informatique: 'product-laptop-1a',
  audio: 'product-headphones-1a',
  accessoires: 'product-cable-1a',
};

const categoryDescriptions: { [key: string]: string } = {
  telephonie: 'Les derniers smartphones et accessoires.',
  informatique: 'Ordinateurs portables pour le travail et le jeu.',
  audio: 'Qualité sonore immersive pour votre musique.',
  accessoires: 'Indispensables pour tous vos appareils.',
};

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  const featuredSlugs = ['telephonie', 'informatique', 'audio', 'accessoires'];
  const featured = categories.filter((c) => featuredSlugs.includes(c.slug));

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="container py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
            Nos univers
          </span>
          <h2 className="mt-1.5 font-headline text-2xl font-extrabold tracking-tight md:text-3xl">
            Explorez par catégorie
          </h2>
          <span className="mt-2 block h-1 w-14 rounded-full bg-gradient-to-r from-accent to-accent/30" />
        </div>
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          Tout voir
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {featured.map((category) => {
          const imageId = categoryImages[category.slug] || 'product-phone-1a';
          const image = findImage(imageId);
          const description = categoryDescriptions[category.slug];

          return (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group block"
            >
              <div className="relative aspect-square overflow-hidden rounded-3xl ring-1 ring-border/60 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-accent/50 group-hover:shadow-[0_24px_50px_-20px_rgba(11,110,79,0.45)]">
                <Image
                  src={image.imageUrl}
                  alt={category.name}
                  data-ai-hint={image.imageHint}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                {category.productCount > 0 && (
                  <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm ring-1 ring-white/20">
                    {category.productCount} articles
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-headline text-lg font-bold text-white drop-shadow-md">
                    {category.name}
                  </h3>
                  {description && (
                    <p className="mt-1 hidden text-xs text-white/80 sm:block">{description}</p>
                  )}
                  <span className="mt-3 inline-flex h-8 items-center gap-1 rounded-full bg-accent px-3 text-xs font-bold text-accent-foreground opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Découvrir
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
