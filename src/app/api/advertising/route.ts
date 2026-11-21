import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { readPublicForm } from "@/lib/public-form-guard";
import { campaignSchema, toCampaign } from "@/lib/advertising";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const admin = req.nextUrl.searchParams.get("admin") === "1";
  if (admin && !(await getSession())?.isAdmin)
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  try {
    // JSON projection keeps reads compatible until the additive order migration is applied.
    const order =
      "order by coalesce((to_jsonb(c)->>'sort_order')::integer,1000),created_at desc,id";
    const rows = await query(
      admin
        ? `select c.* from advertising_campaigns c ${order}`
        : `select c.* from advertising_campaigns c where active and (starts_on is null or starts_on <= (now() at time zone 'Africa/Dakar')::date) and (ends_on is null or ends_on >= (now() at time zone 'Africa/Dakar')::date) ${order} limit 30`,
    );
    const headers: Record<string, string> = { "Cache-Control": "no-store" };
    if (admin) {
      const columns = await query(
        "select 1 from information_schema.columns where table_schema='public' and table_name='advertising_campaigns' and column_name='sort_order'",
      );
      headers["X-Advertising-Ordering"] = columns.length
        ? "ready"
        : "migration-required";
    }
    return NextResponse.json(rows.map(toCampaign), { headers });
  } catch {
    return NextResponse.json(
      { error: "Les espaces publicitaires sont temporairement indisponibles." },
      { status: 503 },
    );
  }
}
export async function POST(req: NextRequest) {
  if (!(await getSession())?.isAdmin)
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  const read = await readPublicForm(req, "advertising-admin", 60, 8192);
  if (read.response) return read.response;
  const parsed = campaignSchema.safeParse(read.body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Vérifiez les champs." },
      { status: 400 },
    );
  const c = parsed.data;
  try {
    if (c.sortOrder !== undefined) {
      const columns = await query(
        "select 1 from information_schema.columns where table_schema='public' and table_name='advertising_campaigns' and column_name='sort_order'",
      );
      if (!columns.length)
        return NextResponse.json(
          {
            error:
              "L’ordre personnalisé doit être activé sur la base avant son enregistrement.",
          },
          { status: 409 },
        );
    }
    const params: any[] = [
      c.id || crypto.randomUUID(),
      c.title,
      c.imageUrl,
      c.targetUrl,
      c.placement,
      c.placement === "catalog" ? c.category : "",
      c.startsOn || null,
      c.endsOn || null,
      c.active,
    ];
    const ordered = c.sortOrder !== undefined;
    if (ordered) params.push(c.sortOrder);
    const rows = await query(
      `insert into advertising_campaigns(id,title,image_url,target_url,placement,category,starts_on,ends_on,active${ordered ? ",sort_order" : ""})
   values($1,$2,$3,$4,$5,$6,$7,$8,$9${ordered ? ",$10" : ""}) on conflict(id) do update set title=excluded.title,image_url=excluded.image_url,target_url=excluded.target_url,placement=excluded.placement,category=excluded.category,starts_on=excluded.starts_on,ends_on=excluded.ends_on,active=excluded.active${ordered ? ",sort_order=excluded.sort_order" : ""} returning *`,
      params,
    );
    return NextResponse.json(toCampaign(rows[0]));
  } catch {
    return NextResponse.json(
      { error: "Enregistrement impossible. Réessayez." },
      { status: 503 },
    );
  }
}
