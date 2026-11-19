import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
export async function POST(req: NextRequest) {
  if (!(await getSession())?.isAdmin)
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  try {
    await query(`DO $$ BEGIN
      CREATE TABLE IF NOT EXISTS engagement_attribution (
        event_id uuid PRIMARY KEY REFERENCES engagement_events(id) ON DELETE CASCADE,
        audience text NOT NULL CHECK (audience IN ('partner','support','legacy')),
        shop_id text, CHECK ((audience='partner') = (shop_id IS NOT NULL)));
      ALTER TABLE engagement_attribution ENABLE ROW LEVEL SECURITY;
      CREATE INDEX IF NOT EXISTS engagement_attribution_shop_idx ON engagement_attribution(shop_id);
    END $$`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Activation indisponible. Réessayez ou contactez le support." },
      { status: 503 },
    );
  }
}
