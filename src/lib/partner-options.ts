import { contactUrl, type Shop, type Listing } from "./marketplace-model";
export const MARJI_SCENTS = [
  "Amouage Guidance 46",
  "Interdit",
  "Scandal Homme",
  "Kayali Coco Vanilla",
  "Touche Mystère",
  "Nuit Trésor",
  "Narciso Poudrée",
  "Mango Hibiscus",
  "Intense Wayfarer",
  "Candy Love",
  "Khamrah",
  "Bleu de Chanel",
  "American S",
  "One Million",
  "La Vie Est Belle",
  "Pink Chiffon",
  "Khair Pistachio",
  "Aura",
  "Kayali 28",
  "Liquid Brun",
  "Symphony",
  "Libre Intense",
  "Club de Nuit Intense Men",
  "Oud & Rose",
  "PM9",
  "Lacoste",
  "Vanilla Aura",
  "Ultra Male",
  "Taj Escada",
  "Bianco Latte",
  "Hypnotic",
  "Kayali Marshmallow",
] as const;
export function scentOptions(listing: Listing): readonly string[] {
  return listing.shop_id === "01b3c412-e007-4639-a764-aef0fd40152b" &&
    listing.id === "3a32229f-c6b2-4c8b-83b4-ad27640ab2f9"
    ? MARJI_SCENTS
    : [];
}
export function selectedContactUrl(shop: Shop, listing: Listing, scent = "") {
  const base = contactUrl(shop, listing);
  if (!scentOptions(listing).includes(scent)) return base;
  const url = new URL(base);
  url.searchParams.set(
    "text",
    url.searchParams.get("text") + " Senteur souhaitée : " + scent + ".",
  );
  return url.toString();
}
export function parseFavoriteIds(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw || "[]");
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (id): id is string =>
                typeof id === "string" && /^[a-zA-Z0-9-]{1,80}$/.test(id),
            ),
          ),
        ].slice(0, 200)
      : [];
  } catch {
    return [];
  }
}
