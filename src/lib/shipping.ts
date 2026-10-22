import type { SiteSettings, DeliveryZone } from './types';

// Legacy type kept for backward-compat
export type DeliveryMethod = 'dakar' | 'hors-dakar';

// ─── Granular Delivery Zones ──────────────────────────────────────────────────

export const DELIVERY_ZONES: DeliveryZone[] = [
  // Dakar intra-muros
  { id: 'plateau',      label: 'Plateau / Centre-Ville',          cost: 1500,  eta: '2-4h',     region: 'dakar' },
  { id: 'almadies',     label: 'Almadies / Ngor / Ouakam',        cost: 2000,  eta: '3-5h',     region: 'dakar' },
  { id: 'medina',       label: 'Médina / Grand Yoff / Mermoz',    cost: 1500,  eta: '2-4h',     region: 'dakar' },
  { id: 'yoff',         label: 'Yoff / Cambérène / Patte d\'Oie', cost: 2000,  eta: '3-5h',     region: 'dakar' },
  { id: 'guediawaye',   label: 'Guédiawaye / Parcelles Assainies',cost: 2500,  eta: '4-6h',     region: 'dakar' },
  { id: 'pikine',       label: 'Pikine / Thiaroye',               cost: 2500,  eta: '4-6h',     region: 'dakar' },
  { id: 'rufisque',     label: 'Rufisque / Bargny',               cost: 3000,  eta: '1 jour',   region: 'dakar' },
  { id: 'diamniadio',   label: 'Diamniadio / Lac Rose',           cost: 3500,  eta: '1 jour',   region: 'dakar' },
  // Hors Dakar
  { id: 'thies',        label: 'Thiès',                           cost: 5000,  eta: '1-2 jours',region: 'hors-dakar' },
  { id: 'saly',         label: 'Mbour / Saly / Petite Côte',      cost: 6000,  eta: '2 jours',  region: 'hors-dakar' },
  { id: 'touba',        label: 'Touba / Mbacké',                  cost: 7000,  eta: '2 jours',  region: 'hors-dakar' },
  { id: 'kaolack',      label: 'Kaolack / Fatick',                cost: 7500,  eta: '2 jours',  region: 'hors-dakar' },
  { id: 'saint-louis',  label: 'Saint-Louis / Louga',             cost: 8000,  eta: '2-3 jours',region: 'hors-dakar' },
  { id: 'ziguinchor',   label: 'Ziguinchor / Casamance',          cost: 10000, eta: '3-4 jours',region: 'hors-dakar' },
  { id: 'tambacounda',  label: 'Tambacounda / Kédougou',          cost: 9000,  eta: '3 jours',  region: 'hors-dakar' },
];

export const RELAY_PICKUP_COST = 500; // flat fee for relay point pickup

export function getZoneById(id: string): DeliveryZone | undefined {
  return DELIVERY_ZONES.find((z) => z.id === id);
}

export function getZonesByRegion(region: 'dakar' | 'hors-dakar'): DeliveryZone[] {
  return DELIVERY_ZONES.filter((z) => z.region === region);
}

// ─── Legacy helpers (backward-compat) ────────────────────────────────────────

export const DEFAULT_SHIPPING_COSTS: Record<DeliveryMethod, number> = {
  dakar: 2000,
  'hors-dakar': 5000,
};

export type ShippingQuote = {
  shippingCost: number;
  baseCost: number;
  isFreeShipping: boolean;
  remainingForFreeShipping: number;
  zone?: DeliveryZone;
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
    remainingForFreeShipping:
      threshold > 0 && !isFreeShipping ? Math.max(threshold - subtotal, 0) : 0,
  };
}

/**
 * Zone-aware quote. Falls back to legacy logic when no zoneId is provided.
 */
export function getZoneShippingQuote(
  settings: Partial<SiteSettings> | null | undefined,
  zoneId: string | null | undefined,
  subtotal: number
): ShippingQuote {
  const zone = zoneId ? getZoneById(zoneId) : undefined;

  if (!zone) {
    // Legacy fallback
    return getShippingQuote(settings, 'dakar', subtotal);
  }

  const threshold = toNumber(settings?.freeShippingThreshold, 0);
  const isFreeShipping = threshold > 0 && subtotal >= threshold;

  return {
    shippingCost: isFreeShipping ? 0 : zone.cost,
    baseCost: zone.cost,
    isFreeShipping,
    remainingForFreeShipping:
      threshold > 0 && !isFreeShipping ? Math.max(threshold - subtotal, 0) : 0,
    zone,
  };
}
