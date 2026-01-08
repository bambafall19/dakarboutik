import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";
import { Button } from "./ui/button";
import { Icons } from "./icons";

interface ProductGridProps {
  title: string;
  products: Product[];
  link?: {
    href: string;
    text: string;
  };
}

export function ProductGrid({ title, products, link }: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        {link && (
          <Button variant="ghost" asChild>
            <Link href={link.href}>
              {link.text}
              <Icons.arrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
