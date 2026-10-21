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
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const available = Number(product.stock) > 0 && product.status !== 'draft';
    if (!available) unavailableProductIds.push(product.id);
    const unit = unitPrice(product as unknown as Product);
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
