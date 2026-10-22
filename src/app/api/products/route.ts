import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

function toProduct(r: any): Product {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    images: r.images ?? [],
    price: Number(r.price),
    salePrice: r.sale_price != null ? Number(r.sale_price) : undefined,
    currency: 'FCA',
    brand: r.brand ?? undefined,
    category: r.category ?? '',
    specs: r.specs && Object.keys(r.specs).length ? r.specs : {},
    stock: Number(r.stock),
    variants: r.variants ?? [],
    status: r.status,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    isBestseller: !!r.is_bestseller,
    isNew: !!r.is_new,
    description: r.description ?? '',
    metaTitle: r.meta_title ?? undefined,
    metaDescription: r.meta_description ?? undefined,
    vendorId: r.vendor_id ?? undefined,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await getSession();
  const isAdmin = !!session?.isAdmin;

  // La boutique associée à un produit est une information interne :
  // elle n'est jamais exposée aux visiteurs.
  const hideVendor = (product: Product): Product => {
    if (!isAdmin) delete product.vendorId;
    return product;
  };

  const slug = searchParams.get('slug');
  if (slug) {
    const rows = await query('select * from products where slug = $1 limit 1', [slug]);
    return NextResponse.json(rows[0] ? hideVendor(toProduct(rows[0])) : null);
  }
  const rows = await query('select * from products order by created_at desc');
  return NextResponse.json(rows.map((row) => hideVendor(toProduct(row))));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const b = await req.json();
  const id = b.id || crypto.randomUUID();
  const rows = await query(
    `insert into products (id,title,slug,images,price,sale_price,currency,brand,category,specs,stock,variants,status,created_at,is_bestseller,is_new,description,meta_title,meta_description,vendor_id)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     returning *`,
    [id, b.title, b.slug, JSON.stringify(b.images ?? []), b.price ?? 0, b.salePrice ?? null, 'FCA', b.brand ?? null,
     b.category ?? null, JSON.stringify(b.specs ?? {}), b.stock ?? 0, JSON.stringify(b.variants ?? []), b.status ?? 'active',
     b.createdAt ?? new Date().toISOString(), !!b.isBestseller, !!b.isNew, b.description ?? '', b.metaTitle ?? null, b.metaDescription ?? null,
     b.vendorId ?? null]
  );
  return NextResponse.json(toProduct(rows[0]));
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const rows = await query(
    `update products set title=$2, slug=$3, images=$4, price=$5, sale_price=$6, brand=$7, category=$8, specs=$9,
       stock=$10, variants=$11, status=$12, is_bestseller=$13, is_new=$14, description=$15, meta_title=$16, meta_description=$17,
       vendor_id=$18
     where id=$1 returning *`,
    [b.id, b.title, b.slug, JSON.stringify(b.images ?? []), b.price ?? 0, b.salePrice ?? null, b.brand ?? null,
     b.category ?? null, JSON.stringify(b.specs ?? {}), b.stock ?? 0, JSON.stringify(b.variants ?? []), b.status ?? 'active',
     !!b.isBestseller, !!b.isNew, b.description ?? '', b.metaTitle ?? null, b.metaDescription ?? null,
     b.vendorId ?? null]
  );
  return NextResponse.json(toProduct(rows[0]));
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  await query('delete from products where id = $1', [id]);
  return NextResponse.json({ ok: true });
}
