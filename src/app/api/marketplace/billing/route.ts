import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { MERCHANT_PLANS, billingEnabled } from "@/lib/merchant-plans";
import { z } from "zod";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
const errors: Record<string, string> = {
  missing: "Demande ou boutique introuvable.",
  reviewed: "Cette demande a déjà été traitée. Actualisez la liste.",
  payment:
    "Le montant et la référence de règlement doivent correspondre au forfait.",
  payment_used: "Cette référence de règlement a déjà servi à une activation.",
  quota:
    "Le catalogue dépasse la limite choisie. Suspendez des fiches ou choisissez un forfait supérieur.",
  plan_change:
    "Un autre forfait est encore actif. Attendez son expiration avant de changer de formule.",
};
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return json({ error: "Connectez-vous." }, 401);
  const admin = req.nextUrl.searchParams.get("admin") === "1";
  if (admin && !session.isAdmin) return json({ error: "Accès refusé." }, 403);
  if (!billingEnabled())
    return json({ enabled: false, memberships: [], requests: [] });
  try {
    const memberships = await query(
      `select m.*,s.profile->>'name' as shop_name,(select count(*)::int from marketplace_listings l where l.shop_id=s.id and l.status in ('pending','approved')) as used from marketplace_memberships m join marketplace_shops s on s.id=m.shop_id ${admin ? "" : "where s.owner_id=$1"}`,
      admin ? [] : [session.uid],
    );
    const requests = await query(
      `select r.*,s.profile->>'name' as shop_name from marketplace_plan_requests r join marketplace_shops s on s.id=r.shop_id ${admin ? "" : "where s.owner_id=$1"} order by r.created_at desc limit 200`,
      admin ? [] : [session.uid],
    );
    return json({ enabled: true, memberships, requests });
  } catch {
    return json(
      { error: "Les forfaits sont temporairement indisponibles. Réessayez." },
      503,
    );
  }
}
export async function POST(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return json({ error: "Origine refusée." }, 403);
  const session = await getSession();
  if (!session) return json({ error: "Connectez-vous." }, 401);
  if (!billingEnabled())
    return json(
      {
        error: "Les offres sont en préparation. Aucun paiement n’est demandé.",
      },
      503,
    );
  if (Number(req.headers.get("content-length") || 0) > 8192)
    return json({ error: "Requête trop volumineuse." }, 413);
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > 8192)
      return json({ error: "Requête trop volumineuse." }, 413);
    let b;
    try {
      b = JSON.parse(raw);
    } catch {
      return json({ error: "Requête invalide." }, 400);
    }
    if (b?.action === "request") {
      const input = z
        .object({
          planId: z.enum(["starter", "growth", "pro"]),
          visibility: z.enum(["none", "featured7", "banner7"]),
          note: z.string().trim().max(500).default(""),
        })
        .strict()
        .parse({ planId: b.planId, visibility: b.visibility, note: b.note });
      const plan = MERCHANT_PLANS.find((p) => p.id === input.planId)!;
      const row = await queryOne(
        `insert into marketplace_plan_requests(id,shop_id,plan_id,product_limit,price_fcfa,visibility,note) select $1,id,$3,$4,$5,$6,$7 from marketplace_shops where owner_id=$2 and status <> 'suspended' on conflict (shop_id) where status='pending' do nothing returning id`,
        [
          crypto.randomUUID(),
          session.uid,
          plan.id,
          plan.limit,
          plan.price,
          input.visibility,
          input.note,
        ],
      );
      return row
        ? json({ ok: true })
        : json(
            {
              error:
                "Créez votre boutique avant de demander un forfait. Une seule demande en attente est autorisée ; contactez l’équipe pour la modifier.",
            },
            409,
          );
    }
    if (!session.isAdmin) return json({ error: "Accès refusé." }, 403);
    if (b?.action === "approve") {
      const input = z
        .object({
          id: z.string().uuid(),
          paid: z.number().int().nonnegative(),
          reference: z.string().trim().min(3).max(120),
          confirmed: z.literal(true),
        })
        .parse(b);
      const row = await queryOne<{ result: string }>(
        "select marketplace_activate_plan($1,$2,$3,$4) as result",
        [input.id, session.uid, input.paid, input.reference],
      );
      return row?.result === "ok"
        ? json({ ok: true })
        : json(
            {
              error:
                errors[row?.result || "missing"] || "Activation impossible.",
            },
            409,
          );
    }
    if (b?.action === "reject") {
      const id = z.string().uuid().parse(b.id);
      const row = await queryOne(
        "update marketplace_plan_requests set status='rejected',reviewed_at=now(),reviewed_by=$2 where id=$1 and status='pending' returning id",
        [id, session.uid],
      );
      return row ? json({ ok: true }) : json({ error: errors.reviewed }, 409);
    }
    return json({ error: "Action inconnue." }, 400);
  } catch (e) {
    if (e instanceof z.ZodError)
      return json(
        { error: e.issues[0]?.message || "Vérifiez les champs." },
        400,
      );
    return json(
      {
        error:
          "Enregistrement indisponible. Aucune activation n’est confirmée ; actualisez avant de réessayer.",
      },
      503,
    );
  }
}
