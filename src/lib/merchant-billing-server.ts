import "server-only";
import { queryOne } from "@/lib/db";
export async function saveBillableListing(
  id: string,
  shopId: string,
  details: unknown,
  status: string,
  isNew: boolean,
) {
  const row = await queryOne<{ result: string }>(
    "select marketplace_billable_listing($1,$2,$3::jsonb,$4,$5) as result",
    [
      id,
      shopId,
      details === null ? null : JSON.stringify(details),
      status,
      isNew,
    ],
  );
  const messages: Record<string, string> = {
    quota:
      "Votre forfait a atteint sa limite. Suspendez une fiche ou demandez un forfait supérieur.",
    expired:
      "Activez ou renouvelez votre forfait avant de soumettre ou publier un produit.",
    inactive: "Aucun forfait actif pour cette boutique.",
    missing: "Annonce introuvable.",
  };
  return row?.result === "ok"
    ? null
    : messages[row?.result || "inactive"] || "Enregistrement impossible.";
}
