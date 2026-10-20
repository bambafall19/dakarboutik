'use client';

import { useWishlist } from '@/hooks/use-wishlist';
import { useProducts } from '@/hooks/use-site-data';
import { ProductGrid } from '@/components/product-grid';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { productIds } = useWishlist();
  const { products, loading } = useProducts();

  const wishlistProducts = useMemo(() => {
    if (loading || !products) return [];
    return products.filter(p => productIds.includes(p.id));
  }, [productIds, products, loading]);

  return (
    <div className="container py-8 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Mes Favoris</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <h1 className="text-3xl font-bold mb-8">Mes Favoris</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : wishlistProducts.length > 0 ? (
        <ProductGrid products={wishlistProducts} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card py-16 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 ring-1 ring-primary/10">
            <Heart className="h-10 w-10 text-primary/60" />
          </span>
          <h2 className="mt-6 font-headline text-xl font-bold">Votre liste de favoris est vide</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">Parcourez nos produits et cliquez sur le cœur pour les ajouter.</p>
          <Button asChild className="mt-6 rounded-full bg-primary hover:bg-primary/90">
            <Link href="/products">Découvrir les produits</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
