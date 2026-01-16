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
        <div className="text-center py-16 border rounded-lg bg-muted/50">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h2 className="mt-4 text-xl font-semibold">Votre liste de favoris est vide.</h2>
          <p className="mt-2 text-muted-foreground">Parcourez nos produits et cliquez sur le cœur pour les ajouter.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Découvrir les produits</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
