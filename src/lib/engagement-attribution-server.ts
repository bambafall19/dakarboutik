import { query } from "@/lib/db";
export async function attributionReady() {
  const rows = await query<{ ready: boolean }>(
    "select to_regclass('public.engagement_attribution') is not null as ready",
  );
  return rows[0]?.ready === true;
}
