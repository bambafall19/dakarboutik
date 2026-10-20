import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const row = await queryOne<{ data: any }>('select data from settings where id = $1', ['siteConfig']);
  const data = row?.data ?? {};
  return NextResponse.json({ id: 'siteConfig', ...data } as SiteSettings);
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
  const row = await queryOne<{ data: any }>('select data from settings where id = $1', ['siteConfig']);
  return NextResponse.json({ id: 'siteConfig', ...(row?.data ?? {}) } as SiteSettings);
}
