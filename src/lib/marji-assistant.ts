import { availabilityLabels, contactUrl, normalizeMarketplaceText, type Listing, type Shop } from "./marketplace-model";
import { partnerProductUrl } from "./partner-products";

export const MARJI_SHOP_ID = "01b3c412-e007-4639-a764-aef0fd40152b";
export type MarjiAnswer = {
  text: string;
  handoff: boolean;
  contactUrl: string;
  products: { id: string; title: string; price: string; availability: string; updatedAt: string; href: string; contactUrl: string }[];
};

const normalize = (value: string) => normalizeMarketplaceText(value).replace(/(\d)\s*ml\b/g, "$1ml").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const stop = new Set("bonjour salut bonsoir merci svp s il te vous plait je j aimerais voudrais veux savoir est ce que c le la les un une des du de d l et ou a au aux en chez pour par avec votre vos mon ma mes quel quels quelle quelles combien coute coutent prix tarif tarifs produit produits parfum parfums disponible disponibles disponibilite stock avez as vous il y sont sont ils elles ml senteur senteurs choix collection extrait extraits".split(" "));

export function answerMarji(shop: Shop | undefined, listings: Listing[], question: string, productId?: string): MarjiAnswer | null {
  if (!shop || shop.id !== MARJI_SHOP_ID || shop.status !== "approved") return null;
  const catalog = listings.filter(item => item.shop_id === shop.id && item.status === "approved");
  const q = normalize(question);
  const handoffUrl = (listing?: Listing) => {
    const url = new URL(contactUrl(shop, listing));
    url.searchParams.set("text", `${url.searchParams.get("text")} Ma question : ${question.slice(0, 300)}`);
    return url.toString();
  };
  const base = { contactUrl: handoffUrl(), products: [], handoff: true };
  if (productId && !catalog.some(item => item.id === productId)) {
    return { ...base, text: "Cette fiche n’est plus publiée. Le vendeur pourra vous proposer une alternative." };
  }
  // These topics require a person; never infer a promise from a price or a description.
  if (/\b(livrai\w*|livre\w*|delai\w*|pai\w*|payer|wave|orange money|remise\w*|reduction\w*|negoci\w*|allerg\w*|grossesse|enceinte|medical\w*|sante|garantie\w*|original\w*|authenti\w*|rembours\w*|reservation\w*|reserver|commande\w*|vendeur|humain|conseiller)\b/.test(q)) {
    return { ...base, contactUrl: handoffUrl(catalog.find(item => item.id === productId)), text: "Cette demande doit être confirmée par MARJI. Ouvrez le brouillon WhatsApp ci-dessous pour échanger avec le vendeur ; aucun message n’est envoyé automatiquement." };
  }
  if (/\b(adresse|quartier|situe|trouver|mbao|horaires?|ouverture)\b/.test(q)) {
    return { ...base, text: `Adresse publiée : ${[shop.profile.address, shop.profile.district, shop.profile.city].filter(Boolean).join(", ")}. Horaires : ${shop.profile.hours || "à confirmer avec MARJI"}.` };
  }
  const words = q.split(" ").filter(word => word && !stop.has(word) && !/^(voir|tous|toutes|montre|montrez|afficher|catalogue|liste|disponibilites|restant|reste|qu|qui|actuellement|encore|maintenant|epuise\w*)$/.test(word));
  const recognized = /\b(prix|tarif\w*|combien|cout\w*|produit\w*|catalogue|disponib\w*|epuise\w*|stock|parfum\w*|senteur\w*|extrait\w*)\b/.test(q);
  if (productId && !recognized) return { ...base, contactUrl: handoffUrl(catalog.find(item => item.id === productId)), text: "Cette question dépasse les prix et disponibilités de la fiche. MARJI pourra vous répondre directement." };
  let matches = productId ? catalog.filter(item => item.id === productId) : words.length ? catalog.filter(item => {
    const text = normalize(`${item.details.title} ${item.details.description}`);
    const tokens = text.split(" ");
    return words.every(word => tokens.some(token => token === word || (word.length >= 4 && token.startsWith(word))));
  }) : recognized ? catalog : [];
  if (!productId && !words.length) {
    if (/\bepuise\w*\b/.test(q)) matches = matches.filter(item => item.details.availability === "sold_out");
    else if (/\bdisponib\w*\b/.test(q)) matches = matches.filter(item => item.details.availability === "available");
  }
  if (!matches.length) return { ...base, text: "Je ne trouve pas de réponse certaine dans les fiches MARJI publiées. Précisez le produit ou la senteur, ou demandez confirmation au vendeur." };
  const scentQuestion = /\b(senteur\w*|aura|vanilla|kayali)\b/.test(q) || (!recognized && !productId);
  return {
    text: scentQuestion
      ? "Voici les fiches correspondantes. Les senteurs annoncées sont détaillées sur chaque fiche ; la disponibilité de chaque senteur doit être confirmée par MARJI. Les prix ci-dessous sont unitaires."
      : "Voici les informations actuellement publiées par MARJI. Les prix sont unitaires et la disponibilité affichée reste à confirmer auprès du vendeur avant achat.",
    handoff: scentQuestion,
    contactUrl: handoffUrl(matches.length === 1 ? matches[0] : undefined),
    products: matches.slice(0, 12).map(item => ({
      id: item.id, title: item.details.title,
      price: `${Number(item.details.price).toLocaleString("fr-FR")} FCFA`,
      availability: availabilityLabels[item.details.availability],
      updatedAt: item.updated_at, href: partnerProductUrl(item), contactUrl: handoffUrl(item),
    })),
  };
}
