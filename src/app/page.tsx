
import { FeaturedCategories } from '@/components/featured-categories';
import { HeroSection } from '@/components/hero-section';
import { ProductGrid } from '@/components/product-grid';
import { getProducts } from '@/lib/data';
import { Engagements } from '@/components/engagements';
import { Testimonials } from '@/components/testimonials';

export default async function HomePage() {
  const allProducts = await getProducts();
  const newArrivals = [...allProducts] // Create a shallow copy before sorting
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
  const bestsellers = allProducts.filter(p => p.isBestseller).slice(0, 8);
  const saleProducts = allProducts.filter(p => p.salePrice).slice(0, 8);

  return (
    <div className="bg-background">
      <HeroSection />
      <div className="container space-y-16 my-16">
        <FeaturedCategories />
        
        <ProductGrid
          title="Nouveautés"
          products={newArrivals}
          link={{ href: '/products?sortBy=newest', text: 'Voir tout' }}
          gridClass="grid-cols-2 md:grid-cols-4"
        />

        {bestsellers.length > 0 && (
          <ProductGrid
            title="Meilleures Ventes"
            products={bestsellers}
            link={{ href: '/products', text: 'Voir tout' }}
            gridClass="grid-cols-2 md:grid-cols-4"
          />
        )}
        
        <Engagements />

        {saleProducts.length > 0 && (
            <ProductGrid
                title="En Promotion"
                products={saleProducts}
                link={{ href: '/products', text: 'Voir tout' }}
                gridClass="grid-cols-2 md:grid-cols-4"
            />
        )}

        <Testimonials />
      </div>
    </div>
  );
}
