import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { readPublicForm } from '@/lib/public-form-guard';
import { eventSchema } from '@/lib/advertising';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
 if (req.headers.get('dnt') === '1' || req.headers.get('sec-gpc') === '1') return new NextResponse(null,{status:204});
 const read = await readPublicForm(req,'engagement',180,2048);
 if (read.response) return read.response;
 const parsed=eventSchema.safeParse(read.body);
 if(!parsed.success) return NextResponse.json({error:'Événement invalide.'},{status:400});
 const e=parsed.data;
 try {
  await query(`insert into engagement_events(id,campaign_id,kind,placement)
   select $1,$2,$3,$4 where $2::uuid is null or exists(select 1 from advertising_campaigns where id=$2::uuid and active and placement=$4 and (starts_on is null or starts_on <= (now() at time zone 'Africa/Dakar')::date) and (ends_on is null or ends_on >= (now() at time zone 'Africa/Dakar')::date))
   on conflict(id) do nothing`,[e.id,e.campaignId||null,e.kind,e.placement]);
  await query("delete from engagement_events where id in (select id from engagement_events where created_at < now()-interval '90 days' limit 500)");
  return new NextResponse(null,{status:204});
 } catch { return new NextResponse(null,{status:503}); }
}
