
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import type { Product, SimpleCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Price } from '@/components/price';
import { Icons } from '@/components/icons';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ProductGrid } from './product-grid';
import { OrderChannels } from './order-channels';
import Link from 'next/link';
import { ProductInfoSidebar } from './product-info-sidebar';
import { useReviews } from '@/hooks/use-reviews';
import { StarRating } from './star-rating';
import { ReviewsSection } from './reviews-section';
import { Skeleton } from './ui/skeleton';
import { useWishlist } from '@/hooks/use-wishlist';
import { Award, Flame, Heart, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isRecentlyAdded } from '@/lib/product-freshness';
import { useSiteSettings } from '@/hooks/use-site-data';


interface ProductDetailsProps {
  product: Product;
  relatedProducts: Product[];
  categoryPath: SimpleCategory[];
}

export function ProductDetails({ product, relatedProducts, categoryPath }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { addToCart } = useCart();
  const { reviews: realReviews, loading: reviewsLoading } = useReviews(product.id);
  const { isProductInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useSiteSettings();
  const isInWishlist = isProductInWishlist(product.id);

  // Use real reviews or an empty array.
  const reviews = useMemo(() => {
    return realReviews || [];
  }, [realReviews]);


  const { averageRating, reviewCount } = useMemo(() => {
    if (reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }
    const reviewCount = reviews.length;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviewCount;
    return { averageRating, reviewCount };
  }, [reviews]);

  useEffect(() => {
    const initialVariants: Record<string, string> = {};
    product.variants?.forEach(variant => {
      if (variant.options.length > 0) {
        initialVariants[variant.name] = variant.options[0].value;
      }
    });
    setSelectedVariants(initialVariants);
  }, [product.variants]);

  const currentStock = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return product.stock;
    }

    for (const variant of product.variants) {
      const selectedOptionValue = selectedVariants[variant.name];
      if (selectedOptionValue) {
        const option = variant.options.find(opt => opt.value === selectedOptionValue);
        if (option) {
          return option.stock;
        }
      }
    }

    return product.stock;
  }, [product, selectedVariants]);

  const handleAddToCart = () => {
    const variantInfo = Object.keys(selectedVariants).length > 0
      ? Object.entries(selectedVariants).map(([name, value]) => ({ name, value }))
      : undefined;

    addToCart(product, quantity, variantInfo);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
  };

  const channelItems = useMemo(
    () => [
      {
        title: product.title,
        quantity,
        unitPrice: product.salePrice ?? product.price,
        options: Object.values(selectedVariants).join(', ') || undefined,
      },
    ],
    [product, quantity, selectedVariants]
  );

  const stockStatus = currentStock > 10 ? 'En stock' : currentStock > 0 ? 'Stock limité' : 'Épuisé';
  const stockBadgeVariant = currentStock > 10 ? 'default' : currentStock > 0 ? 'secondary' : 'destructive';

  const hasDiscount = !!product.salePrice && product.salePrice > 0;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;
  const savings = hasDiscount ? product.price - product.salePrice! : 0;
  const isRecent = isRecentlyAdded(product.createdAt);
  const showNewBadge = product.isNew || isRecent;
  const deliveryCost = settings?.shippingCostDakar ?? 0;

  return (
    <div className="container py-6 md:py-10">
      <Breadcrumb className="mb-5 md:mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Accueil</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {categoryPath.map((cat) => (
            <React.Fragment key={cat.id}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/products?category=${cat.slug}`}>{cat.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Galerie */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-secondary/60 via-background to-secondary/25 shadow-[0_28px_60px_-42px_rgba(16,42,35,0.5)]">
              <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-primary via-accent to-primary/10" />

              <Carousel opts={{ align: 'center' }}>
                <CarouselContent>
                  {product.images?.map((img) => (
                    <CarouselItem key={img.id}>
                      <div className="relative aspect-square w-full">
                        <Image
                          src={img.imageUrl}
                          alt={product.title}
                          data-ai-hint={img.imageHint}
                          fill
                          className="object-contain p-8 md:p-14"
                          sizes="(max-width: 1024px) 100vw, 58vw"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {(product.images?.length ?? 0) > 1 && (
                  <>
                    <CarouselPrevious className="left-3 h-11 w-11 rounded-full bg-white/90 text-foreground shadow-lg ring-1 ring-black/5 transition hover:bg-white" />
                    <CarouselNext className="right-3 h-11 w-11 rounded-full bg-white/90 text-foreground shadow-lg ring-1 ring-black/5 transition hover:bg-white" />
                  </>
                )}
              </Carousel>

              <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col items-start gap-2">
                {hasDiscount && (
                  <span className="inline-flex items-center rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground shadow-md">
                    <Flame className="mr-1.5 h-3.5 w-3.5" />-{discountPct}%
                  </span>
                )}
                {showNewBadge && !hasDiscount && (
                  <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md">
                    Nouveau
                  </span>
                )}
                {product.isBestseller && (
                  <span className="inline-flex items-center rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground shadow-md">
                    <Award className="mr-1.5 h-3.5 w-3.5" />Best-seller
                  </span>
                )}
              </div>
            </div>

            {deliveryCost > 0 && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Truck className="h-4 w-4" />
                </span>
                <p>
                  <span className="font-semibold">Livraison à Dakar dès {deliveryCost.toLocaleString('fr-SN')} FCFA</span>
                  <span className="ml-1 text-primary/75">— retrait en main propre possible à Dakar.</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            {product.brand && (
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                {product.brand}
              </span>
            )}

            <h1 className="mt-1.5 font-headline text-3xl font-extrabold leading-tight tracking-tight lg:text-4xl">
              {product.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Badge
                variant={stockBadgeVariant}
                className={cn(
                  'rounded-full px-3 py-1',
                  currentStock > 10
                    ? 'border-transparent bg-primary/10 text-primary ring-1 ring-primary/15'
                    : currentStock > 0
                      ? 'border-transparent bg-accent/15 text-accent-foreground ring-1 ring-accent/30'
                      : undefined
                )}
              >
                {stockStatus}
              </Badge>

              {reviewsLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : reviewCount > 0 ? (
                <a href="#reviews" className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary">
                  <StarRating rating={averageRating} size={16} />
                  <span>({`${reviewCount} avis`})</span>
                </a>
              ) : (
                <a href="#reviews" className="text-sm text-muted-foreground transition hover:text-primary">
                  Soyez le premier à laisser un avis
                </a>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-border/70 bg-secondary/40 p-5">
              <div className="flex items-end justify-between gap-3">
                <Price
                  price={product.price}
                  salePrice={product.salePrice}
                  currency={product.currency}
                  className="font-headline text-3xl font-extrabold tracking-tight text-foreground"
                />
                {hasDiscount && (
                  <span className="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive ring-1 ring-destructive/15">
                    -{discountPct}%
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                  Vous économisez <span className="text-destructive">{savings.toLocaleString('fr-SN')} FCFA</span>
                </p>
              )}
            </div>

            {product.description && (
              <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </div>
            )}

            {product.variants?.map(variant => (
              <div key={variant.name} className="mt-6">
                <h3 className="mb-2.5 text-sm font-semibold">
                  {variant.name}
                  <span className="ml-2 font-normal text-muted-foreground">
                    {selectedVariants[variant.name]}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map(option => {
                    const active = selectedVariants[variant.name] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option.value }))}
                        className={cn(
                          'rounded-full border px-4 py-2 text-sm font-medium transition',
                          active
                            ? 'border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_-14px_rgba(11,110,79,0.9)]'
                            : 'border-border/80 bg-card text-foreground hover:border-primary/40 hover:bg-primary/5'
                        )}
                      >
                        {option.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-7 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="order-1 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Diminuer la quantité"
                    className="h-12 w-12 rounded-full"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    <Icons.minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-headline text-lg font-bold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Augmenter la quantité"
                    className="h-12 w-12 rounded-full"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    <Icons.plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Ajouter aux favoris"
                  onClick={handleToggleWishlist}
                  className="order-2 h-12 w-12 flex-shrink-0 rounded-full bg-card sm:order-3"
                >
                  <Heart className={cn('h-6 w-6', isInWishlist && 'fill-red-500 text-red-500')} />
                </Button>

                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className="order-3 h-12 w-full flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-18px_rgba(11,110,79,0.95)] transition hover:bg-primary/90 sm:order-2"
                >
                  <Icons.shoppingBag className="mr-2 h-5 w-5" />
                  Ajouter au panier
                </Button>
              </div>

              <OrderChannels items={channelItems} layout="column" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 md:mt-14">
        <ProductInfoSidebar />
      </div>

      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="mt-10 md:mt-14">
          <div className="rounded-3xl border border-border/70 bg-card p-5 md:p-7">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">En détail</span>
            <h3 className="mt-1.5 font-headline text-xl font-extrabold tracking-tight md:text-2xl">
              Fiche technique
            </h3>
            <span className="mt-3 block h-1 w-14 rounded-full bg-gradient-to-r from-accent to-accent/20" />

            <dl className="mt-6 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {Object.entries(product.specs).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-baseline justify-between gap-4 border-b border-border/60 py-3"
                >
                  <dt className="text-sm text-muted-foreground">{key}</dt>
                  <dd className="text-right text-sm font-semibold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      <div className="mt-12">
        <ReviewsSection
          product={product}
          reviews={reviews}
          averageRating={averageRating}
          reviewCount={reviewCount}
        />
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-14">
          <ProductGrid
            title="Produits similaires"
            eyebrow="Vous aimerez peut-être aussi"
            products={relatedProducts}
            gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            accent="gold"
          />
        </div>
      )}
    </div>
  );
}
