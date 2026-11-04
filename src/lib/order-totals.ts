import { query } from './db';
import { getSiteSettings } from './site-settings-server';
import { getShippingQuote, type DeliveryMethod } from './shipping';
import type { CartItem, Product } from './types';

function unitPrice(product: Product): number {
  const price = Number(product.price) || 0;
  const sale = product.salePrice != null ? Number(product.salePrice) : NaN;
  if (Number.isFinite(sale) && sale > 0 && sale < price) return sale;
  return price;
}

function toProduct(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    images: row.images ?? [],
    price: Number(row.price) || 0,
    salePrice: row.sale_price != null ? Number(row.sale_price) : undefined,
    currency: 'FCA',
    brand: row.brand ?? undefined,
    category: row.category ?? '',
    specs: {},
    stock: Number(row.stock) || 0,
    variants: [],
    status: row.status === 'draft' ? 'draft' : 'active',
    createdAt: '',
    description: '',
  };
}

/**
 * Recalcule le sous-total et les frais de livraison a partir de la base.
 * Le client ne doit jamais pouvoir imposer les montants d'une commande.
 */
export async function computeOrderTotals(items: CartItem[], deliveryMethod: DeliveryMethod) {
  // Reject malformed quantities instead of silently turning them into a purchase.
  if (!Array.isArray(items) || items.length === 0 || items.length > 100 || items.some(item =>
    !item || !item.product || typeof item.product.id !== 'string' || !item.product.id ||
    !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 10000
  )) {
    return { totalPrice: 0, shippingCost: 0, grandTotal: 0, isFreeShipping: false,
      itemsAreValid: false, unavailableProductIds: [], sanitizedItems: [] };
  }
  const requested = new Map<string, number>();
  for (const item of items) requested.set(item.product.id, (requested.get(item.product.id) || 0) + item.quantity);
  const productIds = Array.from(
    new Set(items.map((item) => item.product?.id).filter((id): id is string => !!id))
  );

  const rows = productIds.length
    ? await query<any>(
        `select id, title, slug, images, price, sale_price, stock, status, brand, category
         from products where id = any($1)`,
        [productIds]
      )
    : [];

  const catalog = new Map(rows.map((r) => [r.id, r]));
  const settings = await getSiteSettings();

  let subtotal = 0;
  const itemsAreValid = items.length > 0 && rows.length === productIds.length;
  const sanitizedItems: CartItem[] = [];
  const unavailableProductIds: string[] = [];

  for (const item of items) {
    const product = catalog.get(item.product?.id);
    if (!product) continue;
    const quantity = item.quantity;
    const available = Number(product.stock) >= requested.get(product.id)! && product.status === 'active';
    if (!available) unavailableProductIds.push(product.id);
    const unit = unitPrice(toProduct(product));
    subtotal += unit * quantity;
    sanitizedItems.push({
      id: item.id ?? product.id,
      product: {
        ...toProduct(product),
        price: unit,
        salePrice: undefined,
      },
      quantity,
      selectedVariants: item.selectedVariants,
    });
  }

  const quote = getShippingQuote(settings, deliveryMethod, subtotal);

  return {
    totalPrice: Math.round(subtotal),
    shippingCost: Math.round(quote.shippingCost),
    grandTotal: Math.round(subtotal + quote.shippingCost),
    isFreeShipping: quote.isFreeShipping,
    itemsAreValid,
    unavailableProductIds,
    sanitizedItems,
  };
}
