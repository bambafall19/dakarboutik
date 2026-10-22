import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Vendor } from '@/lib/types';

export const dynamic = 'force-dynamic';

function toVendor(r: any): Vendor {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? undefined,
    logoUrl: r.logo_url ?? undefined,
    bannerUrl: r.banner_url ?? undefined,
    ownerId: r.owner_id ?? undefined,
    city: r.city ?? undefined,
    rating: r.rating != null ? Number(r.rating) : undefined,
    reviewCount: Number(r.review_count ?? 0),
    isVerified: !!r.is_verified,
    isActive: r.is_active !== false,
    createdAt:
      r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at ?? ''),
    productCount: r.product_count != null ? Number(r.product_count) : undefined,
  };
}

function slugify(value: string): string {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function uniqueSlug(base: string, currentId?: string): Promise<string> {
  const safeBase = slugify(base) || `boutique-${Date.now().toString(36)}`;
  let candidate = safeBase;
  let suffix = 2;

  while (
    await queryOne('select id from vendors where slug = $1 and id <> $2 limit 1', [
      candidate,
      currentId ?? '',
    ])
  ) {
    candidate = `${safeBase}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeInactive = searchParams.get('all') === '1';

  if (includeInactive) {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }
  }

  const rows = await query(
    `select v.*,
       (select count(*) from products p where p.vendor_id = v.id and p.status = 'active')::int as product_count
     from vendors v
     ${includeInactive ? '' : 'where v.is_active = true'}
     order by v.created_at asc, v.name asc`
  );

  return NextResponse.json(rows.map(toVendor));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const body = await req.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return NextResponse.json({ error: 'Le nom est requis.' }, { status: 400 });

  const id = crypto.randomUUID();
  const slug = await uniqueSlug(body.slug || name);
  const row = await queryOne(
    `insert into vendors (id, slug, name, description, logo_url, banner_url, city, is_verified, is_active)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     returning *`,
    [
      id,
      slug,
      name,
      body.description ?? null,
      body.logoUrl ?? null,
      body.bannerUrl ?? null,
      body.city ?? 'Dakar',
      !!body.isVerified,
      body.isActive !== false,
    ]
  );

  return NextResponse.json(toVendor({ ...row, product_count: 0 }));
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const body = await req.json();
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return NextResponse.json({ error: 'Le nom est requis.' }, { status: 400 });

  const slug = await uniqueSlug(body.slug || name, id);
  const row = await queryOne(
    `update vendors set slug=$2, name=$3, description=$4, logo_url=$5, banner_url=$6,
       city=$7, is_verified=$8, is_active=$9
     where id=$1 returning *`,
    [
      id,
      slug,
      name,
      body.description ?? null,
      body.logoUrl ?? null,
      body.bannerUrl ?? null,
      body.city ?? 'Dakar',
      !!body.isVerified,
      body.isActive !== false,
    ]
  );

  if (!row) return NextResponse.json({ error: 'Boutique introuvable.' }, { status: 404 });

  const count = await queryOne(
    "select count(*)::int as product_count from products where vendor_id = $1 and status = 'active'",
    [id]
  );

  return NextResponse.json(toVendor({ ...row, product_count: count?.product_count ?? 0 }));
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  // Ne jamais supprimer les produits avec la boutique : on les détache seulement.
  await query('update products set vendor_id = null where vendor_id = $1', [id]);
  await query('delete from vendors where id = $1', [id]);

  return NextResponse.json({ ok: true });
}
