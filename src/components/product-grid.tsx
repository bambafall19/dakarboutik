
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
  icon?: React.ReactNode;
}

export function ProductGrid({ title, products, link, gridClass, icon }: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="container px-4 md:px-8">
      {title && (
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-xl md:text-3xl font-bold tracking-tight">{title}</h2>
          </div>
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
      <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6", gridClass)}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
