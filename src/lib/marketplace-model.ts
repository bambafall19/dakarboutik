import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const image = z.union([
  z.literal(""),
  z
    .string()
    .url()
    .max(2000)
    .refine((v) => v.startsWith("https://"), "Utilisez une image HTTPS."),
]);
export const shopSchema = z.object({
  name: text(100).min(2),
  description: text(1500),
  category: text(80).min(2),
  city: text(80).min(2),
  district: text(100),
  address: text(250).min(4),
  hours: text(250),
  whatsapp: z
    .string()
    .regex(
      /^[1-9][0-9]{7,14}$/,
      "Numéro international sans + ni espaces, par exemple 221771234567.",
    ),
  image,
});
export const listingSchema = z.object({
  title: text(150).min(3),
  description: text(2500).min(10),
  category: text(80).min(2),
  price: z.coerce.number().finite().min(0).max(1000000000),
  image,
  productUrl: z.union([
    z.literal(""),
    z.string().trim().url().max(2000).refine(isProductUrl, "Utilisez un lien produit HTTPS sans identifiant ni mot de passe."),
  ]).optional(),
  availability: z.enum(["available", "order", "sold_out"]),
});
export function isProductUrl(value?: string): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}
export type ShopProfile = z.infer<typeof shopSchema>;
export type ListingDetails = z.infer<typeof listingSchema>;
export type ModerationStatus = "pending" | "approved" | "suspended";
export type Shop = {
  id: string;
  profile: ShopProfile;
  status: ModerationStatus;
  sponsored_until: string | null;
  updated_at: string;
};
export type Listing = {
  id: string;
  shop_id: string;
  details: ListingDetails;
  status: ModerationStatus;
  created_at: string;
  updated_at: string;
};
export const availabilityLabels = {
  available: "Disponible",
  order: "Sur commande",
  sold_out: "Épuisé",
};
export const statusLabels = {
  pending: "En attente de validation",
  approved: "Publié",
  suspended: "Suspendu",
};
export function isSponsored(shop: Shop, now = Date.now()) {
  return (
    shop.status === "approved" &&
    !!shop.sponsored_until &&
    new Date(shop.sponsored_until).getTime() > now
  );
}
export function contactUrl(shop: Shop, listing?: Listing) {
  const message = listing
    ? `Bonjour ${shop.profile.name}, je vous contacte via DakarBoutik pour ${listing.details.title} (${listing.details.price.toLocaleString("fr-FR")} FCFA). Est-ce disponible ?`
    : `Bonjour ${shop.profile.name}, je vous contacte via DakarBoutik.`;
  return `https://wa.me/${shop.profile.whatsapp}?text=${encodeURIComponent(message)}`;
}

// Match user-entered labels independently of case, accents and extra spaces.
export function normalizeMarketplaceText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").trim().replace(/\s+/g, " ");
}
