'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Price } from './price';
import { Award, Flame, Heart, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/use-wishlist';
import { isRecentlyAdded } from '@/lib/product-freshness';

import {
  productCardAccents,
  type ProductCardAccent,
} from '@/components/product-card-accents';

export type { ProductCardAccent };

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'horizontal';
  accent?: ProductCardAccent;
}

export function ProductCard({ product, variant = 'default', accent = 'primary' }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isProductInWishlist, toggleWishlist } = useWishlist();
  const isInWishlist = isProductInWishlist(product.id);
  const theme = productCardAccents[accent];

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const isRecent = isRecentlyAdded(product.createdAt);
  const showNewBadge = product.isNew || isRecent;
  const hasDiscount = !!product.salePrice && product.salePrice > 0;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const stockLabel =
    product.stock <= 0 ? 'Épuisé' : product.stock <= 5 ? `Plus que ${product.stock}` : 'En stock';
  const stockClass =
    product.stock <= 0
      ? 'bg-muted text-muted-foreground ring-border'
      : product.stock <= 5
        ? 'bg-accent/15 text-accent-foreground ring-accent/30'
        : 'bg-primary/10 text-primary ring-primary/15';

  const coverImage = product.images?.[0] ?? {
    id: 'not-found',
    description: product.title,
    imageUrl: 'https://placehold.co/600x600?text=DakarBoutik',
    imageHint: 'placeholder',
  };

  if (variant === 'horizontal') {
    return (
      <Card className="group overflow-hidden rounded-xl transition-all duration-300">
        <Link href={`/products/${product.slug}`} className="flex items-center gap-4">
          <div className="relative h-24 w-24 flex-shrink-0 bg-secondary/30">
            <Image
              src={coverImage.imageUrl}
              alt={product.title}
              data-ai-hint={coverImage.imageHint}
              fill
              sizes="100px"
              className="object-contain p-2"
            />
          </div>
          <div className="flex-1 p-2">
            <h3 className="text-sm font-semibold leading-snug">{product.title}</h3>
            <div className="mt-2">
              <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border-border/70 bg-card shadow-[0_1px_2px_rgba(16,42,35,0.04),0_18px_40px_-28px_rgba(16,42,35,0.28)] transition-all duration-300 hover:-translate-y-1.5',
        theme.hover
      )}
    >
      <div className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-secondary/70 via-background to-secondary/20">
          <Image
            src={coverImage.imageUrl}
            alt={product.title}
            data-ai-hint={coverImage.imageHint}
            fill
            className="object-contain p-7 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.06] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <span
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
            theme.topBar
          )}
        />

        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 z-0"
          aria-label={product.title}
        >
          <span className="sr-only">{product.title}</span>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {hasDiscount && (
            <span className="inline-flex items-center rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground shadow-sm">
              <Flame className="mr-1 h-3 w-3" />-{discountPct}%
            </span>
          )}
          {showNewBadge && !hasDiscount && (
            <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-sm">
              Nouveau
            </span>
          )}
          {product.isBestseller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground shadow-sm">
              <Award className="h-3 w-3" />Best-seller
            </span>
          )}
        </div>

        <Button
          size="icon"
          variant="secondary"
          aria-label="Ajouter aux favoris"
          className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-white/90 text-foreground shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:scale-105 hover:bg-white"
          onClick={handleToggleWishlist}
        >
          <Heart className={cn('h-4 w-4', isInWishlist && 'fill-red-500 text-red-500')} />
        </Button>

        <Button
          size="sm"
          aria-label="Ajouter au panier"
          className={cn(
            'absolute inset-x-3 bottom-3 z-10 hidden h-10 translate-y-3 items-center justify-center rounded-full text-sm font-semibold opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:inline-flex',
            theme.action
          )}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter au panier
        </Button>
      </div>

      <CardContent className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {product.brand || 'DakarBoutik'}
          </span>
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1',
              stockClass
            )}
          >
            {stockLabel}
          </span>
        </div>

        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <Price
            price={product.price}
            salePrice={product.salePrice}
            currency={product.currency}
            className="font-headline text-lg font-extrabold tracking-tight text-primary"
          />
          <Button
            size="icon"
            variant="ghost"
            aria-label="Ajout rapide au panier"
            className={cn(
              'h-9 w-9 shrink-0 rounded-full text-primary transition hover:text-primary-foreground md:hidden',
              theme.action
            )}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
