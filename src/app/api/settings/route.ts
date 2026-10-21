import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getSiteSettings } from '@/lib/site-settings-server';
import type { SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json((await getSiteSettings()) as SiteSettings);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const b = await req.json();
  const { id, ...data } = b;
  await queryOne(
    `insert into settings (id, data) values ('siteConfig', $1)
     on conflict (id) do update set data = settings.data || $1
     returning id`,
    [JSON.stringify(data)]
  );
  return NextResponse.json((await getSiteSettings()) as SiteSettings);
}
