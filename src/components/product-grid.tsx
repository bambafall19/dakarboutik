import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";
import { Button } from "./ui/button";
import { Icons } from "./icons";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  title?: string;
  products: Product[];
  link?: {
    href: string;
    text: string;
  };
  gridClass?: string;
}

export function ProductGrid({ title, products, link, gridClass }: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section>
      {title && (
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
      )}
      <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6", gridClass)}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}