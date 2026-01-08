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
    }).format(amount).replace(/\s/g, ''); // remove space for compact display
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {salePrice ? (
        <>
          <span className="font-bold text-base text-red-500">
            {formatPrice(salePrice)}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(price)}
          </span>
        </>
      ) : (
        <span className="font-bold text-base text-foreground">
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}
