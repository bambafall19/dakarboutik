
import { HeroSection } from '@/components/hero-section';
import { ProductGrid } from '@/components/product-grid';
import { FeaturedCategories } from '@/components/featured-categories';
import { PromoBanners } from '@/components/promo-banners';
import { Engagements } from '@/components/engagements';
import { Icons } from '@/components/icons';
import { getProducts, getBanners, getCategories as getRawCategories } from '@/lib/data-firebase';
import { RecentProductsGrid } from '@/components/recent-products-grid';
import { getCategoriesWithCounts } from '@/lib/data-helpers';
import { getNewProducts } from '@/lib/product-freshness';
import { Star, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [allProducts, allBanners, rawCategories] = await Promise.all([
    getProducts(),
    getBanners(),
    getRawCategories(),
  ]);

  const categories = getCategoriesWithCounts(rawCategories, allProducts);

  const newProducts = getNewProducts(allProducts);
  
  const bestsellers = allProducts.filter(p => p.isBestseller).slice(0, 8);
  
  const saleProducts = allProducts.filter(p => p.salePrice && p.salePrice > 0).slice(0, 8);

  return (
    <div className="flex flex-col">
      <HeroSection banners={allBanners} loading={false} />
      
      <main className="flex flex-col gap-10 md:gap-12 lg:gap-14 py-6">
        <FeaturedCategories categories={categories} />
        
        {newProducts.length > 0 && (
          <div className="container">
            <ProductGrid 
              title="Nouveaux arrivages"
              eyebrow="Fraîchement en boutique"
              products={newProducts}
              link={{href: "/products?sortBy=newest", text: "Voir tout"}}
              gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              icon={<Icons.flash />}
              accent="primary"
            />
          </div>
        )}
        
        <PromoBanners banners={allBanners} loading={false} />

        {bestsellers.length > 0 && (
           <div className="container">
             <ProductGrid 
              title="Nos meilleures ventes"
              eyebrow="Les favoris des clients"
              products={bestsellers}
              link={{href: "/products", text: "Voir tout"}}
              gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              icon={<Star />}
              accent="gold"
            />
           </div>
        )}

        {saleProducts.length > 0 && (
           <div className="container">
             <ProductGrid 
              title="Promotions"
              eyebrow="Prix réduits, stock limité"
              products={saleProducts}
              link={{href: "/products", text: "Voir tout"}}
              gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              icon={<Tag />}
              accent="sale"
            />
           </div>
        )}

        <RecentProductsGrid />
        
        <Engagements />

      </main>
    </div>
  );
}
