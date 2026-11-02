import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { shopSchema, listingSchema } from "@/lib/marketplace-model";
import { z } from "zod";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Connectez-vous." }, { status: 401 });
  const admin = req.nextUrl.searchParams.get("admin") === "1";
  if (admin && !session.isAdmin)
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const shops = await query(
    `select id,profile,status,sponsored_until,updated_at from marketplace_shops ${admin ? "" : "where owner_id=$1"} order by updated_at desc`,
    admin ? [] : [session.uid],
  );
  const listings = await query(
    `select l.* from marketplace_listings l join marketplace_shops s on s.id=l.shop_id ${admin ? "" : "where s.owner_id=$1"} order by l.updated_at desc`,
    admin ? [] : [session.uid],
  );
  return NextResponse.json({ shops, listings });
}

export async function POST(req: NextRequest) {
  // Requests are JSON and must come from this origin. Auth and ownership are checked again on every write.
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Connectez-vous." }, { status: 401 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  try {
    if (body.action === "shop") {
      const profile = shopSchema.parse(body.profile);
      const row = await queryOne(
        `insert into marketplace_shops(id,owner_id,profile) values($1,$2,$3::jsonb)
    on conflict(owner_id) do update set profile=excluded.profile, status=case when marketplace_shops.status='suspended' then 'suspended' else 'pending' end, updated_at=now() returning id`,
        [crypto.randomUUID(), session.uid, JSON.stringify(profile)],
      );
      return NextResponse.json(row);
    }
    if (body.action === "listing") {
      const details = listingSchema.parse(body.details);
      const shop = await queryOne(
        `select id from marketplace_shops where owner_id=$1 and status <> 'suspended'`,
        [session.uid],
      );
      if (!shop)
        return NextResponse.json(
          {
            error:
              "Créez une boutique ou contactez l’administrateur si elle est suspendue.",
          },
          { status: 403 },
        );
      if (body.id) {
        const id = z.string().uuid().parse(body.id);
        const row = await queryOne(
          `update marketplace_listings set details=$1::jsonb,status='pending',updated_at=now() where id=$2 and shop_id=$3 returning id`,
          [JSON.stringify(details), id, shop.id],
        );
        if (!row)
          return NextResponse.json(
            { error: "Annonce introuvable." },
            { status: 404 },
          );
      } else {
        await query(
          `insert into marketplace_listings(id,shop_id,details) values($1,$2,$3::jsonb)`,
          [crypto.randomUUID(), shop.id, JSON.stringify(details)],
        );
      }
      return NextResponse.json({ ok: true });
    }
    if (body.action === "availability") {
      const id = z.string().uuid().parse(body.id);
      const availability = listingSchema.shape.availability.parse(
        body.availability,
      );
      const row = await queryOne(
        `update marketplace_listings l set details=jsonb_set(l.details,'{availability}',to_jsonb($1::text)),updated_at=now() from marketplace_shops s where l.shop_id=s.id and s.owner_id=$2 and s.status <> 'suspended' and l.id=$3 returning l.id`,
        [availability, session.uid, id],
      );
      if (!row)
        return NextResponse.json(
          { error: "Annonce introuvable." },
          { status: 404 },
        );
      return NextResponse.json({ ok: true });
    }
    if (body.action === "moderate") {
      if (!session.isAdmin)
        return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
      const input = z
        .object({
          kind: z.enum(["shop", "listing"]),
          id: z.string().uuid(),
          status: z.enum(["pending", "approved", "suspended"]),
          sponsoredUntil: z.union([z.string().datetime(), z.null()]).optional(),
        })
        .parse(body);
      const row =
        input.kind === "shop"
          ? await queryOne(
              `update marketplace_shops set status=$1,sponsored_until=$2,updated_at=now() where id=$3 returning id`,
              [input.status, input.sponsoredUntil ?? null, input.id],
            )
          : await queryOne(
              `update marketplace_listings set status=$1 where id=$2 returning id`,
              [input.status, input.id],
            );
      if (!row)
        return NextResponse.json(
          { error: "Élément introuvable." },
          { status: 404 },
        );
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(" ") },
        { status: 400 },
      );
    console.error("Marketplace write failed", error);
    return NextResponse.json(
      { error: "Enregistrement impossible. Réessayez." },
      { status: 500 },
    );
  }
}
