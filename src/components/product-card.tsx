'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Price } from './price';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/use-wishlist';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isProductInWishlist, toggleWishlist } = useWishlist();
  const isInWishlist = isProductInWishlist(product.id);

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

  const isRecent = new Date(product.createdAt) > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const showNewBadge = product.isNew || isRecent;
  const hasDiscount = !!product.salePrice && product.salePrice > 0;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  if (variant === 'horizontal') {
    return (
      <Card className="group overflow-hidden rounded-xl transition-all duration-300">
        <Link href={`/products/${product.slug}`} className="flex items-center gap-4">
          <div className="relative h-24 w-24 flex-shrink-0 bg-secondary/30">
            <Image
              src={product.images[0].imageUrl}
              alt={product.title}
              data-ai-hint={product.images[0].imageHint}
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
    <Card className="card-premium group relative flex h-full flex-col overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_28px_55px_-22px_rgba(11,110,79,0.35)]">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden">
          <div className="relative aspect-[4/5] w-full bg-gradient-to-b from-secondary/50 via-secondary/20 to-transparent">
            <Image
              src={product.images[0].imageUrl}
              alt={product.title}
              data-ai-hint={product.images[0].imageHint}
              fill
              className="object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-[1.08]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {hasDiscount && (
              <Badge className="rounded-full border-transparent bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground shadow-sm">
                -{discountPct}%
              </Badge>
            )}
            {showNewBadge && !hasDiscount && (
              <Badge className="rounded-full border-transparent bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-sm">
                Nouveau
              </Badge>
            )}
          </div>

          <Button
            size="icon"
            variant="secondary"
            aria-label="Ajouter aux favoris"
            className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur transition hover:bg-white hover:scale-105"
            onClick={handleToggleWishlist}
          >
            <Heart className={cn('h-4 w-4', isInWishlist && 'fill-red-500 text-red-500')} />
          </Button>

          <Button
            size="icon"
            aria-label="Ajouter au panier"
            className="absolute bottom-3 right-3 h-10 w-10 translate-y-2 rounded-full bg-primary opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-primary/90 max-md:translate-y-0 max-md:opacity-100"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-accent">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-current" />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">(4.8)</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <Price
            price={product.price}
            salePrice={product.salePrice}
            currency={product.currency}
            className="text-base font-extrabold tracking-tight text-primary"
          />
          <Button
            size="icon"
            variant="ghost"
            aria-label="Ajouter au panier"
            className="h-9 w-9 shrink-0 rounded-full bg-primary/10 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground md:hidden"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
