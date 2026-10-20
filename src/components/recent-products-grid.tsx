'use client';

import { useRecentProducts } from '@/hooks/use-recent-products';
import { ProductGrid } from './product-grid';
import { Icons } from './icons';

export function RecentProductsGrid() {
    const { recentProducts, isLoaded } = useRecentProducts();

    if (!isLoaded || recentProducts.length === 0) {
        return null;
    }
    
    return (
        <div className="container">
            <ProductGrid 
              title="Suggestions pour vous"
              products={recentProducts}
              gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              icon={<Icons.sparkles className="text-primary" />}
            />
        </div>
    );
}
