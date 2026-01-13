import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  salePrice?: number;
  currency: 'XOF';
  className?: string;
}

export function Price({ price, salePrice, currency, className }: PriceProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('F CFA', 'FCFA').replace(/\s/g, ' ');
  };

  const hasSale = typeof salePrice === 'number' && salePrice > 0;

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      {hasSale ? (
        <>
          <span className="font-bold text-base text-destructive">
            {formatPrice(salePrice)}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(price)}
          </span>
        </>
      ) : (
        <span className="font-bold text-base">
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}
