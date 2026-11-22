import { NextRequest, NextResponse, after } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { sendShopAlert, shopEmailConfig } from "@/lib/shop-notifications";
import { z } from "zod";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  if (!(await getSession())?.isAdmin)
    return json({ error: "Accès refusé." }, 403);
  try {
    const pending = await queryOne<{ count: number }>(
      "select count(*)::int as count from marketplace_shops where status='pending'",
    );
    const notifications = await query(
      `select s.id,s.profile->>'name' as name,s.profile->>'category' as category,s.profile->>'city' as city,s.status,s.created_at,a.email_status,a.sent_at from marketplace_shops s left join marketplace_shop_alerts a on a.shop_id=s.id where s.status='pending' order by s.created_at desc limit 10`,
    );
    const pendingProducts = await queryOne<{ count: number }>("select count(*)::int as count from marketplace_listings where status='pending'");
    const products = await query(`select l.id,l.shop_id,l.details->>'title' as title,s.profile->>'name' as shop_name,l.updated_at
      from marketplace_listings l join marketplace_shops s on s.id=l.shop_id where l.status='pending' order by l.updated_at desc,l.id limit 5`);
    return json({
      pendingCount: pending?.count || 0,
      pendingProductsCount: pendingProducts?.count || 0,
      products,
      notifications,
      emailConfigured: !!shopEmailConfig(),
    });
  } catch {
    return json({ error: "Notifications temporairement indisponibles." }, 503);
  }
}
export async function POST(req: NextRequest) {
  if (!(await getSession())?.isAdmin)
    return json({ error: "Accès refusé." }, 403);
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return json({ error: "Origine refusée." }, 403);
  if (Number(req.headers.get("content-length") || 0) > 512)
    return json({ error: "Requête trop volumineuse." }, 413);
  try {
    const raw = await req.text();
    if (raw.length > 512)
      return json({ error: "Requête trop volumineuse." }, 413);
    const input = z
      .object({ id: z.string().uuid() })
      .strict()
      .safeParse(JSON.parse(raw));
    if (!input.success) return json({ error: "Demande invalide." }, 400);
    if (!shopEmailConfig())
      return json(
        {
          error:
            "Configurez le destinataire et le service e-mail avant de réessayer.",
        },
        409,
      );
    const row = await queryOne(
      `select shop_id from marketplace_shop_alerts where shop_id=$1 and ((email_status in ('queued','failed','unconfigured') and (last_attempt_at is null or last_attempt_at<now()-interval '1 minute')) or (email_status='sending' and last_attempt_at<now()-interval '5 minutes'))`,
      [input.data.id],
    );
    if (!row)
      return json(
        { error: "Cet envoi est déjà traité, en cours ou trop récent." },
        409,
      );
    after(() => sendShopAlert(input.data.id));
    return json({ ok: true });
  } catch {
    return json({ error: "Relance indisponible." }, 503);
  }
}
