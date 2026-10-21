import type { SiteSettings } from './types';

export type DeliveryMethod = 'dakar' | 'hors-dakar';

export const DEFAULT_SHIPPING_COSTS: Record<DeliveryMethod, number> = {
  dakar: 2000,
  'hors-dakar': 5000,
};

export type ShippingQuote = {
  shippingCost: number;
  baseCost: number;
  isFreeShipping: boolean;
  remainingForFreeShipping: number;
};

function toNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function getShippingBaseCost(
  settings: Partial<SiteSettings> | null | undefined,
  method: DeliveryMethod
): number {
  const fallback = DEFAULT_SHIPPING_COSTS[method] ?? 0;
  const configured =
    method === 'dakar' ? settings?.shippingCostDakar : settings?.shippingCostOutsideDakar;
  return toNumber(configured, fallback);
}

export function getShippingQuote(
  settings: Partial<SiteSettings> | null | undefined,
  method: DeliveryMethod,
  subtotal: number
): ShippingQuote {
  const baseCost = getShippingBaseCost(settings, method);
  const threshold = toNumber(settings?.freeShippingThreshold, 0);
  const isFreeShipping = threshold > 0 && subtotal >= threshold;

  return {
    shippingCost: isFreeShipping ? 0 : baseCost,
    baseCost,
    isFreeShipping,
    remainingForFreeShipping: threshold > 0 && !isFreeShipping ? Math.max(threshold - subtotal, 0) : 0,
  };
}
