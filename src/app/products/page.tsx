
import { ProductListing } from '@/components/product-listing';
import { getProducts, getSimpleCategories } from '@/lib/data';

const allCategories = getSimpleCategories();


export default async function ProductsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}) {
  const products = await getProducts();
  const allBrands = [...new Set(products.map(p => p.brand))];
  
  return (
    <ProductListing 
        products={products}
        categories={allCategories}
        brands={allBrands}
        initialCategory={searchParams.category as string}
    />
  )
}
