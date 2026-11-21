import { sendShopAlert } from "@/lib/shop-notifications";
import { NextRequest, NextResponse, after } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { shopSchema, listingSchema } from "@/lib/marketplace-model";
import { z } from "zod";
import { billingEnabled } from "@/lib/merchant-plans";
import { saveBillableListing } from "@/lib/merchant-billing-server";

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
    if (body.action === "admin-save-shop") {
      if (!session.isAdmin) return NextResponse.json({error:"Accès refusé."},{status:403});
      const shopId = z.string().uuid().parse(body.shopId);
      const profile = shopSchema.parse(body.profile);
      const row = await queryOne("update marketplace_shops set profile=$1::jsonb,updated_at=now() where id=$2 returning id", [JSON.stringify(profile),shopId]);
      return NextResponse.json(row ? {ok:true} : {error:"Boutique introuvable."},{status:row ? 200 : 404});
    }
    if (body.action === "admin-save-listing" || body.action === "admin-delete-listing") {
      if (!session.isAdmin)
        return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

      const shopId = z.string().uuid().parse(body.shopId);
      const id = z.string().uuid();
      let row;
      if (body.action === "admin-delete-listing") {
        row = await queryOne(
          "delete from marketplace_listings where id=$1 and shop_id=$2 returning id",
          [id.parse(body.id), shopId],
        );
      } else {
        const parsedDetails = listingSchema.parse(body.details);
        const details = JSON.stringify(parsedDetails);
        const listingId = id.optional().parse(body.id);
        const desiredStatus = z.enum(["pending", "approved"]).optional().parse(body.status);
        if (desiredStatus === "approved") {
          const shop = await queryOne("select status from marketplace_shops where id=$1", [shopId]);
          if (!shop || shop.status !== "approved") return NextResponse.json({error:"Publiez d’abord la boutique avant de publier ses produits."},{status:409});
        }
        if (billingEnabled()) {
          const shop = await queryOne("select id from marketplace_shops where id=$1",[shopId]);
          if(!shop) return NextResponse.json({error:"Boutique introuvable."},{status:404});
          const current = listingId ? await queryOne("select status from marketplace_listings where id=$1 and shop_id=$2",[listingId,shopId]) : null;
          if(listingId&&!current) return NextResponse.json({error:"Annonce introuvable."},{status:404});
          const error=await saveBillableListing(listingId||crypto.randomUUID(),shopId,parsedDetails,desiredStatus||current?.status||"pending",!listingId);
          return NextResponse.json(error?{error}:{ok:true},{status:error?409:200});
        }
        row = listingId
          ? await queryOne(
              "update marketplace_listings set details=$1::jsonb,status=coalesce($4,status),updated_at=now() where id=$2 and shop_id=$3 returning id",
              [details, listingId, shopId, desiredStatus ?? null],
            )
          : await queryOne(
              `insert into marketplace_listings(id,shop_id,details,status)
               select $1,id,$3::jsonb,$4 from marketplace_shops where id=$2 returning id`,
              [crypto.randomUUID(), shopId, details, desiredStatus ?? "pending"],
            );
      }
      if (!row)
        return NextResponse.json({ error: "Boutique ou annonce introuvable." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
    if (body.action === "shop") {
      const profile = shopSchema.parse(body.profile);
      const row = await queryOne<{
        id: string;
        notification_id: string | null;
      }>(
        `with saved as (
          insert into marketplace_shops(id,owner_id,profile) values($1,$2,$3::jsonb)
          on conflict(owner_id) do update set profile=excluded.profile,status=case when marketplace_shops.status='suspended' then 'suspended' else 'pending' end,updated_at=now()
          returning id,(xmax=0) as created
        ), queued as (
          insert into marketplace_shop_alerts(shop_id) select id from saved where created
          on conflict(shop_id) do nothing returning shop_id
        ) select saved.id,(select shop_id from queued) as notification_id from saved`,
        [crypto.randomUUID(), session.uid, JSON.stringify(profile)],
      );
      if (row?.notification_id)
        after(() => sendShopAlert(row.notification_id!));
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
      if (billingEnabled()) {
        const id=body.id?z.string().uuid().parse(body.id):crypto.randomUUID();
        const error=await saveBillableListing(id,shop.id,details,"pending",!body.id);
        return NextResponse.json(error?{error}:{ok:true},{status:error?409:200});
      }
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
      if(billingEnabled()&&input.kind==="listing") {
        const listing=await queryOne("select shop_id from marketplace_listings where id=$1",[input.id]);
        if(!listing) return NextResponse.json({error:"Annonce introuvable."},{status:404});
        const error=await saveBillableListing(input.id,listing.shop_id,null,input.status,false);
        return NextResponse.json(error?{error}:{ok:true},{status:error?409:200});
      }
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
