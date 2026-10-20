import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function toCategory(r: any) {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    parentId: r.parent_id ?? null,
    order: r.order ?? 0,
    bannerImageUrl: r.banner_image_url ?? undefined,
  };
}

export async function GET() {
  const rows = await query('select * from categories order by "order" asc, name asc');
  return NextResponse.json(rows.map(toCategory));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const b = await req.json();
  const id = b.id || crypto.randomUUID();
  const rows = await query(
    'insert into categories (id,name,slug,parent_id,"order",banner_image_url) values ($1,$2,$3,$4,$5,$6) returning *',
    [id, b.name, b.slug, b.parentId ?? null, b.order ?? 0, b.bannerImageUrl ?? null]
  );
  return NextResponse.json(toCategory(rows[0]));
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const rows = await query(
    'update categories set name=$2, slug=$3, parent_id=$4, "order"=$5, banner_image_url=$6 where id=$1 returning *',
    [b.id, b.name, b.slug, b.parentId ?? null, b.order ?? 0, b.bannerImageUrl ?? null]
  );
  return NextResponse.json(toCategory(rows[0]));
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  await query('delete from categories where id = $1', [id]);
  return NextResponse.json({ ok: true });
}
