import type { SiteSettings } from './types';
import { getShippingQuote, type DeliveryMethod } from './shipping';

export type OrderChannelItem = {
  title: string;
  quantity: number;
  unitPrice: number;
  options?: string;
};

export type OrderChannelPayload = {
  items: OrderChannelItem[];
  subtotal: number;
  deliveryMethod?: DeliveryMethod;
  deliveryLabel?: string;
  shippingCost?: number;
  total?: number;
};

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  dakar: 'Dakar',
  'hors-dakar': 'Hors de Dakar',
};

export function formatFcfa(amount: number): string {
  return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
}

/** Numéro international sans séparateur, prêt pour wa.me. */
export function normalizeWhatsAppNumber(value?: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
}

/** Numéro affichable pour un lien tel:. */
export function normalizePhoneNumber(value?: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8) return null;
  // Ignore les numéros de remplacement (000 000 00 00, 11111111, 33 123 45 67, ...)
  if (/^(\d)\1+$/.test(digits)) return null;
  if (digits.includes('000000')) return null;
  if (digits.includes('1234567')) return null;
  if (value.trim().startsWith('+')) return `+${digits}`;
  // 11 chiffres ou plus => format international (ex: 221 77 638 46 76)
  return digits.length >= 11 ? `+${digits}` : digits;
}

export function getWhatsAppNumber(settings?: Partial<SiteSettings> | null): string | null {
  return normalizeWhatsAppNumber(settings?.whatsappNumber);
}

/** Numéro à utiliser pour passer commande par téléphone. */
export function getOrderPhoneNumber(settings?: Partial<SiteSettings> | null): string | null {
  return (
    normalizePhoneNumber(settings?.phone) ??
    normalizePhoneNumber(settings?.supportPhone) ??
    normalizeWhatsAppNumber(settings?.whatsappNumber)
  );
}

export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildPhoneUrl(number: string): string {
  return `tel:${number}`;
}

export function buildOrderMessage(payload: OrderChannelPayload): string {
  const { items, subtotal } = payload;
  const lines: string[] = ['*NOUVELLE COMMANDE DAKARBOUTIK* 📦', ''];

  if (items.length === 1) {
    const item = items[0];
    lines.push(`*Produit :* ${item.title}`);
    if (item.options) {
      lines.push(`*Options :* ${item.options}`);
    }
    lines.push(`💰 *Prix unitaire :* ${formatFcfa(item.unitPrice)}`);
    lines.push(`🔢 *Quantité :* ${item.quantity}`);
    lines.push(`💵 *Total :* ${formatFcfa(item.unitPrice * item.quantity)}`);
  } else {
    items.forEach((item, index) => {
      lines.push(`*${index + 1}. ${item.title}*`);
      if (item.options) {
        lines.push(`*Options :* ${item.options}`);
      }
      lines.push(`💰 *Prix unitaire :* ${formatFcfa(item.unitPrice)}`);
      lines.push(`🔢 *Quantité :* ${item.quantity}`);
      lines.push(`💵 *Total ligne :* ${formatFcfa(item.unitPrice * item.quantity)}`);
      lines.push('');
    });
    lines.push(`🧾 *Sous-total :* ${formatFcfa(subtotal)}`);
  }

  if (payload.shippingCost !== undefined) {
    const label = payload.deliveryLabel ?? (payload.deliveryMethod ? DELIVERY_LABELS[payload.deliveryMethod] : '');
    const shipping = payload.shippingCost === 0 ? 'Offerte' : formatFcfa(payload.shippingCost);
    lines.push(`🚚 *Livraison${label ? ` (${label})` : ''} :* ${shipping}`);
    lines.push(`💵 *Total à payer :* ${formatFcfa(payload.total ?? subtotal + payload.shippingCost)}`);
  }

  lines.push('');
  lines.push('👤 *Mes informations (à compléter) :*');
  lines.push('Nom : ');
  lines.push('Téléphone : ');
  lines.push('Adresse : ');
  lines.push('');
  lines.push('💳 Paiement à la livraison');

  return lines.join('\n');
}

/** Calcule le devis de livraison (si la méthode est connue) et renvoie le message prêt à envoyer. */
export function buildOrderPayload(
  settings: Partial<SiteSettings> | null | undefined,
  items: OrderChannelItem[],
  deliveryMethod?: DeliveryMethod
): OrderChannelPayload {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  if (!deliveryMethod) {
    return { items, subtotal };
  }

  const quote = getShippingQuote(settings, deliveryMethod, subtotal);
  return {
    items,
    subtotal,
    deliveryMethod,
    deliveryLabel: DELIVERY_LABELS[deliveryMethod],
    shippingCost: quote.shippingCost,
    total: subtotal + quote.shippingCost,
  };
}

export function buildWhatsAppOrderUrl(
  settings: Partial<SiteSettings> | null | undefined,
  payload: OrderChannelPayload
): string | null {
  const number = getWhatsAppNumber(settings);
  if (!number) return null;
  return buildWhatsAppUrl(number, buildOrderMessage(payload));
}
