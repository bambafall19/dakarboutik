import { FeaturedCategories } from '@/components/featured-categories';
import { HeroSection } from '@/components/hero-section';
import { ProductGrid } from '@/components/product-grid';
import { getBestsellers, getNewArrivals } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function HomePage() {
  const newArrivals = await getNewArrivals(8);
  const bestsellers = await getBestsellers(8);

  return (
    <div className="bg-background">
      <HeroSection />
      <div className="container">
        <FeaturedCategories />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 my-12">
          <main className="lg:col-span-3">
            <ProductGrid
              title="Flash Sale"
              products={newArrivals}
              gridClass="grid-cols-2 md:grid-cols-3"
            />
          </main>
          <aside className="lg:col-span-1">
             <div className="sticky top-24 space-y-6">
               <h2 className="text-xl font-bold">Todays For You!</h2>
               <div className="grid grid-cols-1 gap-4">
                {bestsellers.slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} variant="horizontal" />
                ))}
               </div>
             </div>
          </aside>
        </div>

        <div className="my-12">
           <Tabs defaultValue="bestseller" className="w-full">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold">Todays For You!</h2>
              <TabsList>
                <TabsTrigger value="bestseller">Best Seller</TabsTrigger>
                <TabsTrigger value="new">Keep Stylish</TabsTrigger>
                <TabsTrigger value="special">Special Discount</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="bestseller">
              <ProductGrid products={bestsellers} gridClass="grid-cols-2 md:grid-cols-4" />
            </TabsContent>
            <TabsContent value="new">
               <ProductGrid products={newArrivals} gridClass="grid-cols-2 md:grid-cols-4" />
            </TabsContent>
             <TabsContent value="special">
               <ProductGrid products={bestsellers.filter(p => p.salePrice)} gridClass="grid-cols-2 md:grid-cols-4" />
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}