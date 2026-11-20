import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { readPublicForm } from "@/lib/public-form-guard";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Connectez-vous." }, { status: 401 });
  const input = await readPublicForm(req, "merchant-advertising", 3, 8192);
  if (input.response) return input.response;
  const parsed = z
    .object({
      placement: z.enum(["home", "shops"]),
      days: z.enum(["7", "14", "30"]),
      email: z.string().trim().email().max(254),
      start: z
        .string()
        .regex(/^(?:|\d{4}-\d{2}-\d{2})$/)
        .refine(
          (v) =>
            !v ||
            (Number.isFinite(Date.parse(v)) &&
              new Date(v).toISOString().slice(0, 10) === v),
          "Date invalide.",
        ),
      note: z.string().trim().max(1000),
    })
    .strict()
    .safeParse(input.body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Vérifiez les champs de la demande." },
      { status: 400 },
    );
  try {
    const shop = await queryOne<{ id: string; name: string }>(
      "select id,profile->>'name' as name from marketplace_shops where owner_id=$1 and status <> 'suspended'",
      [session.uid],
    );
    if (!shop)
      return NextResponse.json(
        { error: "Créez une boutique active avant de demander une publicité." },
        { status: 409 },
      );
    const b = parsed.data;
    await queryOne(
      "insert into contact_messages(id,name,email,subject,message) values($1,$2,$3,$4,$5) returning id",
      [
        crypto.randomUUID(),
        shop.name,
        b.email,
        `Demande publicité · ${shop.name}`.slice(0, 200),
        `Boutique : ${shop.name}\nIdentifiant : ${shop.id}\nEmplacement : ${b.placement === "home" ? "Accueil" : "Page des boutiques"}\nDurée : ${b.days} jours\nDébut souhaité : ${b.start || "À convenir"}\nPrécisions : ${b.note || "Aucune"}\nDemande de devis uniquement. Aucun paiement ni activation automatique.`,
      ],
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Envoi indisponible. Réessayez plus tard." },
      { status: 503 },
    );
  }
}
