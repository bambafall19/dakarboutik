import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { readPublicForm } from '@/lib/public-form-guard';
import { campaignSchema, toCampaign } from '@/lib/advertising';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
 const admin = req.nextUrl.searchParams.get('admin') === '1';
 if (admin && !(await getSession())?.isAdmin) return NextResponse.json({error:'Accès refusé.'},{status:403});
 try {
  const rows = await query(admin ? 'select * from advertising_campaigns order by created_at desc' : `select * from advertising_campaigns where active and (starts_on is null or starts_on <= (now() at time zone 'Africa/Dakar')::date) and (ends_on is null or ends_on >= (now() at time zone 'Africa/Dakar')::date) order by created_at desc limit 30`);
  return NextResponse.json(rows.map(toCampaign), { headers:{'Cache-Control':'no-store'} });
 } catch { return NextResponse.json({error:'Les espaces publicitaires sont temporairement indisponibles.'},{status:503}); }
}
export async function POST(req: NextRequest) {
 if (!(await getSession())?.isAdmin) return NextResponse.json({error:'Accès refusé.'},{status:403});
 if (req.headers.get('origin') !== req.nextUrl.origin) return NextResponse.json({error:'Origine refusée.'},{status:403});
 const read=await readPublicForm(req,'advertising-admin',60,8192);
 if(read.response) return read.response;
 const parsed = campaignSchema.safeParse(read.body);
 if (!parsed.success) return NextResponse.json({error:parsed.error.issues[0]?.message || 'Vérifiez les champs.'},{status:400});
 const c=parsed.data;
 const rows=await query(`insert into advertising_campaigns(id,title,image_url,target_url,placement,category,starts_on,ends_on,active)
 values($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict(id) do update set title=excluded.title,image_url=excluded.image_url,target_url=excluded.target_url,placement=excluded.placement,category=excluded.category,starts_on=excluded.starts_on,ends_on=excluded.ends_on,active=excluded.active returning *`,
 [c.id || crypto.randomUUID(),c.title,c.imageUrl,c.targetUrl,c.placement,c.placement==='catalog'?c.category:'',c.startsOn||null,c.endsOn||null,c.active]);
 return NextResponse.json(toCampaign(rows[0]));
}
