import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest) {
 if(!(await getSession())?.isAdmin) return NextResponse.json({error:'Accès refusé.'},{status:403});
 const days = ['7','30','90'].includes(req.nextUrl.searchParams.get('days')||'') ? Number(req.nextUrl.searchParams.get('days')) : 30;
 try {
 const [totals,daily,campaigns] = await Promise.all([
  query("select kind,count(*)::int as total from engagement_events where created_at >= ((date_trunc('day',now() at time zone 'Africa/Dakar') - (($1::int-1)*interval '1 day')) at time zone 'Africa/Dakar') group by kind",[days]),
  query("select to_char(created_at at time zone 'Africa/Dakar','YYYY-MM-DD') as day,kind,count(*)::int as total from engagement_events where created_at >= ((date_trunc('day',now() at time zone 'Africa/Dakar') - (($1::int-1)*interval '1 day')) at time zone 'Africa/Dakar') group by 1,2 order by 1",[days]),
  query(`select c.id,c.title,count(e.id) filter(where e.kind='ad_view')::int as views,count(e.id) filter(where e.kind='ad_click')::int as clicks from advertising_campaigns c left join engagement_events e on e.campaign_id=c.id and e.created_at >= ((date_trunc('day',now() at time zone 'Africa/Dakar') - (($1::int-1)*interval '1 day')) at time zone 'Africa/Dakar') group by c.id,c.title order by views desc`,[days]),
 ]);
 return NextResponse.json({days,totals,daily,campaigns},{headers:{'Cache-Control':'private, no-store'}});
 } catch {return NextResponse.json({error:'Statistiques temporairement indisponibles.'},{status:503});}
}
