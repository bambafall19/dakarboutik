import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { statisticsDays } from "@/lib/partner-statistics";
import { attributionReady } from "@/lib/engagement-attribution-server";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  if (!(await getSession())?.isAdmin)
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const days = statisticsDays(req.nextUrl.searchParams.get("days"));
  try {
    const [totals, daily, campaigns, orderCounts] = await Promise.all([
      query(
        "select kind,count(*)::int as total from engagement_events where created_at >= ((date_trunc('day',now() at time zone 'Africa/Dakar') - (($1::int-1)*interval '1 day')) at time zone 'Africa/Dakar') group by kind",
        [days],
      ),
      query(
        "select to_char(created_at at time zone 'Africa/Dakar','YYYY-MM-DD') as day,kind,count(*)::int as total from engagement_events where created_at >= ((date_trunc('day',now() at time zone 'Africa/Dakar') - (($1::int-1)*interval '1 day')) at time zone 'Africa/Dakar') group by 1,2 order by 1",
        [days],
      ),
      query(
        `select c.id,c.title,count(e.id) filter(where e.kind='ad_view')::int as views,count(e.id) filter(where e.kind='ad_click')::int as clicks from advertising_campaigns c left join engagement_events e on e.campaign_id=c.id and e.created_at >= ((date_trunc('day',now() at time zone 'Africa/Dakar') - (($1::int-1)*interval '1 day')) at time zone 'Africa/Dakar') group by c.id,c.title order by views desc`,
        [days],
      ),
      query<{ total: number }>(
        `select count(*)::int as total from orders
     where order_id not like 'DKB-TEST-%'
       and coalesce(customer_info->>'name','') !~* '^[[:space:]]*TEST[[:space:]]+INTERNE([^[:alnum:]_]|$)'
       and created_at >= ((date_trunc('day',now() at time zone 'Africa/Dakar') - (($1::int-1)*interval '1 day')) at time zone 'Africa/Dakar')`,
        [days],
      ),
    ]);
    const ready = await attributionReady();
    const since =
      "e.created_at >= ((date_trunc('day',now() at time zone 'Africa/Dakar') - (($1::int-1)*interval '1 day')) at time zone 'Africa/Dakar')";
    const [shops, partnerTotals, partnerDaily, contactSources] = ready
      ? await Promise.all([
          query(
            `with counts as (select a.shop_id,count(*) filter(where e.kind='shop_view')::int as views,count(*) filter(where e.kind='whatsapp_click')::int as clicks from engagement_attribution a join engagement_events e on e.id=a.event_id where a.audience='partner' and ${since} group by a.shop_id)
       select coalesce(s.id,c.shop_id) as id,coalesce(s.profile->>'name','Boutique retirée') as name,coalesce(s.status,'removed') as status,coalesce(c.views,0)::int as views,coalesce(c.clicks,0)::int as clicks from marketplace_shops s full join counts c on c.shop_id=s.id order by clicks desc,views desc,name`,
            [days],
          ),
          query(
            `select e.kind,count(*)::int as total from engagement_events e join engagement_attribution a on a.event_id=e.id where a.audience='partner' and ${since} group by e.kind`,
            [days],
          ),
          query(
            `select to_char(e.created_at at time zone 'Africa/Dakar','YYYY-MM-DD') as day,e.kind,count(*)::int as total from engagement_events e join engagement_attribution a on a.event_id=e.id where a.audience='partner' and ${since} group by 1,2 order by 1`,
            [days],
          ),
          query(
            `select coalesce(a.audience,'unattributed') as audience,count(*) filter(where e.kind='whatsapp_click')::int as clicks,count(*) filter(where e.kind='shop_view')::int as views from engagement_events e left join engagement_attribution a on a.event_id=e.id where e.kind in ('shop_view','whatsapp_click') and ${since} group by 1`,
            [days],
          ),
        ])
      : [[], [], [], []];
    return NextResponse.json(
      {
        days,
        attributionReady: ready,
        shops,
        partnerTotals,
        partnerDaily,
        contactSources,
        totals,
        daily,
        campaigns,
        orderCount: orderCounts[0]?.total ?? 0,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Statistiques temporairement indisponibles." },
      { status: 503 },
    );
  }
}
