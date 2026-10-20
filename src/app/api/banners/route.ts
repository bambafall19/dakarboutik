import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function toBanner(r: any) {
  return {
    id: r.id,
    title: r.title ?? '',
    subtitle: r.subtitle ?? undefined,
    images: r.images ?? [],
    linkUrl: r.link_url ?? '',
    position: r.position ?? 'hero',
    isActive: !!r.is_active,
    order: r.order ?? 0,
  };
}

export async function GET() {
  const rows = await query('select * from banners order by "order" asc');
  return NextResponse.json(rows.map(toBanner));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const b = await req.json();
  const id = b.id || crypto.randomUUID();
  const rows = await query(
    'insert into banners (id,title,subtitle,images,link_url,position,is_active,"order") values ($1,$2,$3,$4,$5,$6,$7,$8) returning *',
    [id, b.title ?? null, b.subtitle ?? null, JSON.stringify(b.images ?? []), b.linkUrl ?? null, b.position ?? 'hero', b.isActive !== false, b.order ?? 0]
  );
  return NextResponse.json(toBanner(rows[0]));
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const rows = await query(
    'update banners set title=$2, subtitle=$3, images=$4, link_url=$5, position=$6, is_active=$7, "order"=$8 where id=$1 returning *',
    [b.id, b.title ?? null, b.subtitle ?? null, JSON.stringify(b.images ?? []), b.linkUrl ?? null, b.position ?? 'hero', b.isActive !== false, b.order ?? 0]
  );
  return NextResponse.json(toBanner(rows[0]));
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  await query('delete from banners where id = $1', [id]);
  return NextResponse.json({ ok: true });
}
