
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { productCardAccents, type ProductCardAccent } from "@/components/product-card-accents";
import type { Product } from "@/lib/types";
import { Icons } from "./icons";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  title?: string;
  eyebrow?: string;
  products: Product[];
  link?: {
    href: string;
    text: string;
  };
  gridClass?: string;
  icon?: React.ReactNode;
  accent?: ProductCardAccent;
}

export function ProductGrid({
  title,
  eyebrow,
  products,
  link,
  gridClass,
  icon,
  accent = 'primary',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 ring-1 ring-primary/10">
          <Icons.search className="h-8 w-8 text-primary/60" />
        </span>
        <h2 className="mt-5 font-headline text-xl font-bold">Aucun produit trouvé</h2>
        <p className="mt-2 text-sm text-muted-foreground">Essayez de changer vos filtres.</p>
      </div>
    );
  }

  const theme = productCardAccents[accent];

  return (
    <section>
      {title && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-9">
          <div className="min-w-0">
            {eyebrow && (
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                {eyebrow}
              </span>
            )}
            <div className="mt-1.5 flex items-center gap-3.5">
              {icon && (
                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 [&>svg]:h-5 [&>svg]:w-5',
                    theme.chip
                  )}
                >
                  {icon}
                </span>
              )}
              <h2 className="font-headline text-2xl font-extrabold tracking-tight md:text-3xl">
                {title}
              </h2>
            </div>
            <span className="mt-3 block h-1 w-14 rounded-full bg-gradient-to-r from-accent to-accent/20" />
          </div>
          {link && (
            <Link
              href={link.href}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {link.text}
              <Icons.arrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      )}
      <div className={cn('grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6 md:gap-y-10', gridClass)}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} accent={accent} />
        ))}
      </div>
    </section>
  );
}
