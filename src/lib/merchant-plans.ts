export const MERCHANT_PLANS = [
  {
    id: "starter",
    name: "Essentiel",
    limit: 10,
    price: 2000,
    description:
      "Pour lancer votre boutique et présenter une première sélection.",
  },
  {
    id: "growth",
    name: "Commerce",
    limit: 30,
    price: 5000,
    description:
      "Pour un catalogue varié, avec de nouvelles références régulièrement.",
  },
  {
    id: "pro",
    name: "Pro",
    limit: 100,
    price: 10000,
    description: "Pour les boutiques avec un catalogue étendu.",
  },
] as const;
export type PlanId = (typeof MERCHANT_PLANS)[number]["id"];
export const VISIBILITY_OPTIONS = [
  {
    id: "none",
    name: "Sans publicité",
    description: "Présence normale dans les résultats. Aucun supplément.",
  },
  {
    id: "featured7",
    name: "Boutique à la une · 7 jours",
    description:
      "Votre boutique dans une sélection sponsorisée. Tarif et dates sur devis.",
  },
  {
    id: "banner7",
    name: "Bannière publicitaire · 7 jours",
    description:
      "Une bannière sur un emplacement convenu : accueil ou boutiques. Visuel, tarif et dates sur devis.",
  },
] as const;
export type VisibilityId = (typeof VISIBILITY_OPTIONS)[number]["id"];
export const formatFcfa = (value: number) =>
  `${value.toLocaleString("fr-FR")} FCFA`;
export const billingEnabled = () =>
  process.env.MARKETPLACE_BILLING_ENABLED === "true";
export type Membership = {
  shop_id: string;
  plan_id: PlanId | null;
  state: "legacy" | "inactive" | "active";
  product_limit: number;
  valid_until: string | null;
  used: number;
};
export type PlanRequest = {
  id: string;
  shop_id: string;
  shop_name: string;
  plan_id: PlanId;
  visibility: VisibilityId;
  price_fcfa: number;
  product_limit: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
  payment_reference?: string;
  note: string;
};
