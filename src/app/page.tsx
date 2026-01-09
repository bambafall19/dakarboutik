import { FeaturedCategories } from '@/components/featured-categories';
import { HeroSection } from '@/components/hero-section';
import { ProductGrid } from '@/components/product-grid';
import { getBestsellers, getNewArrivals } from '@/lib/data';

export default async function HomePage() {
  const newArrivals = await getNewArrivals();
  const bestsellers = await getBestsellers();

  return (
    <div className="flex flex-col gap-12 md:gap-16 lg:gap-20">
      <HeroSection />
      <div className="container px-4 md:px-6">
        <FeaturedCategories />
      </div>
      <div className="container px-4 md:px-6">
        <ProductGrid
          title="Nouveautés"
          products={newArrivals}
          link={{ href: '/products', text: 'Voir tout' }}
        />
      </div>
      <div className="container px-4 md:px-6">
        <ProductGrid
          title="Meilleures Ventes"
          products={bestsellers}
          link={{ href: '/products', text: 'Voir tout' }}
        />
      </div>
    </div>
  );
}
