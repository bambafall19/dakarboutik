import Link from 'next/link';
import Image from 'next/image';
import { findImage } from '@/lib/placeholder-images';
import type { Category } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import { CategoryIcons, Icons } from './icons';
import { cn } from '@/lib/utils';

const categoryImages: { [key: string]: string } = {
  'telephones-and-tablettes': 'product-phone-1a',
  informatique: 'product-laptop-1a',
  audio: 'product-headphones-1a',
  accessoires: 'product-cable-1a',
};

const categoryDescriptions: { [key: string]: string } = {
  'telephones-and-tablettes': 'Les derniers smartphones, tablettes et accessoires.',
  informatique: 'Ordinateurs portables pour le travail et le jeu.',
  audio: 'Qualité sonore immersive pour votre musique.',
  accessoires: 'Indispensables pour tous vos appareils.',
};

const featuredOrder = ['telephones-and-tablettes', 'informatique', 'audio', 'accessoires'];

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  const featured = [
    ...featuredOrder
      .map((slug) => categories.find((c) => c.slug === slug))
      .filter((c): c is Category => Boolean(c)),
    ...categories.filter((c) => !featuredOrder.includes(c.slug)),
  ].slice(0, 4);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="container py-8 md:py-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 md:mb-9">
        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
            Nos univers
          </span>
          <h2 className="mt-1.5 font-headline text-2xl font-extrabold tracking-tight md:text-3xl">
            Explorez par catégorie
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Des essentiels choisis pour le quotidien, la maison et le bureau.
          </p>
          <span className="mt-3 block h-1 w-14 rounded-full bg-gradient-to-r from-accent to-accent/20" />
        </div>
        <Link
          href="/products"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          Tout voir
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3.5 md:auto-rows-[190px] md:grid-cols-4 md:gap-5">
        {featured.map((category, index) => {
          const imageId = categoryImages[category.slug] || 'product-phone-1a';
          const image = findImage(imageId);
          const description = categoryDescriptions[category.slug];
          const Icon = CategoryIcons[category.slug] ?? Icons.layoutGrid;
          const count = category.productCount ?? 0;
          const href = `/products?category=${category.slug}`;

          if (index === 3) {
            return (
              <Link
                key={category.id}
                href={href}
                className="group col-span-2 flex min-h-[190px] overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-[#0a5a41] text-white shadow-[0_24px_60px_-34px_rgba(11,110,79,0.8)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative w-1/2 shrink-0 overflow-hidden md:w-[42%]">
                  <Image
                    src={image.imageUrl}
                    alt={category.name}
                    data-ai-hint={image.imageHint}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/30 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-2 p-5 md:p-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                    Notre sélection
                  </span>
                  <h3 className="font-headline text-xl font-extrabold leading-tight md:text-2xl">
                    {category.name}
                  </h3>
                  {description && (
                    <p className="line-clamp-2 text-sm text-white/75">{description}</p>
                  )}
                  <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                    {count > 0 ? `${count} articles` : 'Découvrir'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          }

          const isHero = index === 0;

          return (
            <Link
              key={category.id}
              href={href}
              className={cn(
                'group relative overflow-hidden rounded-3xl ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:ring-accent/50 hover:shadow-[0_28px_60px_-30px_rgba(11,110,79,0.6)]',
                isHero
                  ? 'col-span-2 min-h-[290px] md:row-span-2 md:min-h-0'
                  : 'min-h-[220px] md:min-h-0'
              )}
            >
              <Image
                src={image.imageUrl}
                alt={category.name}
                data-ai-hint={image.imageHint}
                fill
                sizes={isHero ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
              />
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-t transition-colors duration-300',
                  isHero
                    ? 'from-black/90 via-black/45 to-black/10'
                    : 'from-black/85 via-black/40 to-black/10'
                )}
              />

              <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm',
                        isHero && 'bg-black/30'
                      )}
                    >
                      {count} articles
                    </span>
                  )}
                </div>

                <div>
                  <h3
                    className={cn(
                      'font-headline font-extrabold leading-tight text-white drop-shadow-md',
                      isHero ? 'text-2xl md:text-3xl' : 'text-lg'
                    )}
                  >
                    {category.name}
                  </h3>
                  {description && (
                    <p
                      className={cn(
                        'mt-1 text-white/80',
                        isHero ? 'max-w-sm text-sm' : 'hidden text-xs sm:block'
                      )}
                    >
                      {description}
                    </p>
                  )}
                  <span
                    className={cn(
                      'mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground transition-all duration-300',
                      isHero
                        ? 'translate-y-0 opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    )}
                  >
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
