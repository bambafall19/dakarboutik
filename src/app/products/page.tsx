
import { ProductListing } from '@/components/product-listing';
import { getProducts, getCategories } from '@/lib/data';

const allCategories = getCategories();
const allBrands = [...new Set((await getProducts()).map(p => p.brand))];

export default async function ProductsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}) {
  const products = await getProducts();
  
  return (
    <ProductListing 
        products={products}
        categories={allCategories}
        brands={allBrands}
        initialCategory={searchParams.category as string}
    />
  )
}
