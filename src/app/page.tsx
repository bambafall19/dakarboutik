
import { FeaturedCategories } from '@/components/featured-categories';
import { HeroSection } from '@/components/hero-section';
import { ProductGrid } from '@/components/product-grid';
import { getBestsellers, getNewArrivals, getProducts } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function HomePage() {
  const allProducts = await getProducts();
  const newArrivals = allProducts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
  const bestsellers = allProducts.filter(p => p.isBestseller).slice(0, 8);
  const saleProducts = allProducts.filter(p => p.salePrice).slice(0, 8);

  return (
    <div className="bg-background">
      <HeroSection />
      <div className="container space-y-12 my-12">
        <FeaturedCategories />
        
        <ProductGrid
          title="Nouveautés"
          products={newArrivals}
          link={{ href: '/products?sortBy=newest', text: 'Voir tout' }}
          gridClass="grid-cols-2 md:grid-cols-4"
        />

        <ProductGrid
          title="Meilleures Ventes"
          products={bestsellers}
          link={{ href: '/products', text: 'Voir tout' }}
          gridClass="grid-cols-2 md:grid-cols-4"
        />

        {saleProducts.length > 0 && (
            <ProductGrid
                title="En Promotion"
                products={saleProducts}
                link={{ href: '/products', text: 'Voir tout' }}
                gridClass="grid-cols-2 md:grid-cols-4"
            />
        )}
      </div>
    </div>
  );
}
