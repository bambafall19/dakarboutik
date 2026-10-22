
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import type { Product, SimpleCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Award, Flame, Heart, Truck, ShieldCheck, Sparkles, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isRecentlyAdded } from '@/lib/product-freshness';
import { useSiteSettings } from '@/hooks/use-site-data';


interface ProductDetailsProps {
  product: Product;
  relatedProducts: Product[];
  categoryPath: SimpleCategory[];
}

const formatCfa = (value: number) => new Intl.NumberFormat('fr-SN').format(value);

export function ProductDetails({ product, relatedProducts, categoryPath }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
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

  // Initialise la sélection de variantes (première option de chaque groupe)
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>({});
  const [previousProductId, setPreviousProductId] = useState(product.id);
  if (previousProductId !== product.id) {
    setPreviousProductId(product.id);
    setVariantSelections({});
  }

  const selectedVariants = useMemo(() => {
    const resolved: Record<string, string> = {};
    product.variants?.forEach(variant => {
      const chosen = variantSelections[variant.name];
      resolved[variant.name] = chosen ?? variant.options[0]?.value ?? '';
    });
    return resolved;
  }, [product.variants, variantSelections]);

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

  const images = product.images ?? [];
  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[Math.min(activeImage, images.length - 1)] : null;

  return (
    <div className="container pb-[calc(9rem+env(safe-area-inset-bottom))] pt-4 md:pb-16 md:pt-8">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        {/* ── Galerie ────────────────────────────────────────────────── */}
        <div className="lg:col-span-7">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-secondary/70 via-background to-secondary/30 shadow-[0_34px_70px_-48px_rgba(16,42,35,0.6)]">
              <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-primary via-accent to-primary/10" />

              <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-col items-start gap-2">
                {hasDiscount && (
                  <span className="inline-flex items-center rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground shadow-md">
                    <Flame className="mr-1.5 h-3.5 w-3.5" />-{discountPct}%
                  </span>
                )}
                {showNewBadge && !hasDiscount && (
                  <span className="inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />Nouveau
                  </span>
                )}
                {product.isBestseller && (
                  <span className="inline-flex items-center rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground shadow-md">
                    <Award className="mr-1.5 h-3.5 w-3.5" />Best-seller
                  </span>
                )}
              </div>

              <div className="relative aspect-square w-full">
                {currentImage ? (
                  <Image
                    key={currentImage.id}
                    src={currentImage.imageUrl}
                    alt={product.title}
                    data-ai-hint={currentImage.imageHint}
                    fill
                    priority
                    className="object-contain p-6 transition-transform duration-500 hover:scale-[1.03] md:p-14"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PackageCheck className="h-20 w-20 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 lg:grid-cols-5">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Voir l'image ${index + 1}`}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-2xl border-2 bg-background transition-all duration-300',
                      index === activeImage
                        ? 'border-primary shadow-[0_14px_28px_-18px_rgba(11,110,79,0.9)] ring-2 ring-primary/15'
                        : 'border-border/60 opacity-70 hover:-translate-y-0.5 hover:border-primary/40 hover:opacity-100'
                    )}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={`${product.title} - vue ${index + 1}`}
                      fill
                      className="object-contain p-1.5"
                      sizes="120px"
                    />
                  </button>
                ))}
              </div>
            )}

            {deliveryCost > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/8 to-accent/8 px-4 py-3.5 text-sm text-primary">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Truck className="h-4.5 w-4.5" />
                </span>
                <p>
                  <span className="font-semibold">Livraison à Dakar dès {formatCfa(deliveryCost)} FCFA</span>
                  <span className="ml-1 text-primary/75">— retrait en main propre possible à Dakar.</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Informations ───────────────────────────────────────────── */}
        <div className="lg:col-span-5">
          <div className="space-y-5 rounded-3xl border border-border/70 bg-card/80 p-5 shadow-[0_30px_70px_-55px_rgba(16,42,35,0.8)] backdrop-blur md:p-7 lg:sticky lg:top-24">
            <div>
              {product.brand && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {product.brand}
                </span>
              )}

              <h1 className="mt-3 text-balance font-headline text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                {product.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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

              {currentStock > 0 && currentStock <= 10 && (
                <span className="text-xs font-semibold text-accent">Plus que {currentStock} en stock</span>
              )}

              {reviewsLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : reviewCount > 0 ? (
                <a href="#reviews" className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary">
                  <StarRating rating={averageRating} size={16} />
                  <span className="font-semibold text-foreground">{averageRating.toFixed(1)}</span>
                  <span>({`${reviewCount} avis`})</span>
                </a>
              ) : (
                <a href="#reviews" className="text-sm text-muted-foreground transition hover:text-primary">
                  Soyez le premier à laisser un avis
                </a>
              )}
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-secondary/70 via-background to-accent/10 p-5">
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
                  Vous économisez <span className="text-destructive">{formatCfa(savings)} FCFA</span>
                </p>
              )}
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Produit authentique · Paiement à la livraison
              </p>
            </div>

            {product.description && (
              <div className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </div>
            )}

            {product.variants?.map(variant => (
              <div key={variant.name}>
                <h3 className="mb-2.5 flex items-center gap-2 text-sm font-semibold">
                  {variant.name}
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
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
                        onClick={() => setVariantSelections(prev => ({ ...prev, [variant.name]: option.value }))}
                        className={cn(
                          'rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300',
                          active
                            ? 'border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_-14px_rgba(11,110,79,0.9)]'
                            : 'border-border/80 bg-card text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5'
                        )}
                      >
                        {option.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="order-1 flex items-center gap-2 rounded-full border border-border/70 bg-background p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Diminuer la quantité"
                    className="h-10 w-10 rounded-full hover:bg-secondary"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    <Icons.minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-headline text-lg font-bold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Augmenter la quantité"
                    className="h-10 w-10 rounded-full hover:bg-secondary"
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
                  className="order-2 h-12 w-12 flex-shrink-0 rounded-full bg-card"
                >
                  <Heart className={cn('h-6 w-6 transition', isInWishlist && 'fill-red-500 text-red-500')} />
                </Button>

                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className="order-3 h-12 w-full flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-18px_rgba(11,110,79,0.95)] transition hover:bg-primary/90 sm:order-2"
                >
                  <Icons.shoppingBag className="mr-2 h-5 w-5" />
                  {currentStock === 0 ? 'Indisponible' : 'Ajouter au panier'}
                </Button>
              </div>

              <OrderChannels items={channelItems} layout="column" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Réassurance ──────────────────────────────────────────────── */}
      <div className="mt-10 md:mt-14">
        <ProductInfoSidebar />
      </div>

      {/* ── Description & fiche technique ───────────────────────────── */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:mt-14 lg:grid-cols-2">
        {product.description && (
          <div className="rounded-3xl border border-border/70 bg-card p-5 md:p-7">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">En détail</span>
            <h2 className="mt-1.5 font-headline text-xl font-extrabold tracking-tight md:text-2xl">
              Description
            </h2>
            <span className="mt-3 block h-1 w-14 rounded-full bg-gradient-to-r from-accent to-accent/20" />
            <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </div>
          </div>
        )}

        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="rounded-3xl border border-border/70 bg-card p-5 md:p-7">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Caractéristiques</span>
            <h2 className="mt-1.5 font-headline text-xl font-extrabold tracking-tight md:text-2xl">
              Fiche technique
            </h2>
            <span className="mt-3 block h-1 w-14 rounded-full bg-gradient-to-r from-accent to-accent/20" />

            <dl className="mt-5 space-y-1">
              {Object.entries(product.specs).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-baseline justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors odd:bg-secondary/40"
                >
                  <dt className="text-sm text-muted-foreground">{key}</dt>
                  <dd className="text-right text-sm font-semibold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

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

      {/* ── Barre d'action mobile ───────────────────────────────────── */}
      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-border/70 bg-background/95 px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pr-[5.5rem] backdrop-blur-lg md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <Price
              price={product.price}
              salePrice={product.salePrice}
              currency={product.currency}
              className="font-headline text-base font-extrabold tracking-tight text-foreground"
            />
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={currentStock === 0}
            className="h-11 shrink-0 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_14px_28px_-18px_rgba(11,110,79,0.95)]"
          >
            <Icons.shoppingBag className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
}
