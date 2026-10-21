import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function toReview(r: any) {
  return {
    id: r.id,
    productId: r.product_id,
    productTitle: r.product_title ?? null,
    productImage: r.product_image ?? null,
    rating: Number(r.rating),
    title: r.title ?? '',
    text: r.text ?? '',
    author: r.author ?? '',
    isPublished: r.is_published !== false,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  };
}

export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const productId = params.get('productId');
  const session = await getSession();

  if (productId) {
    const rows = await query(
      'select * from reviews where product_id = $1 and is_published = true order by created_at desc',
      [productId]
    );
    return NextResponse.json(rows.map(toReview));
  }

  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const rows = await query(
    `select r.*, p.title as product_title,
            case when jsonb_array_length(p.images) > 0 then p.images->0->>'imageUrl' else null end as product_image
       from reviews r
       left join products p on p.id = r.product_id
      order by r.created_at desc`
  );
  return NextResponse.json(rows.map(toReview));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  const b = await req.json();
  if (!b.productId) return NextResponse.json({ error: 'productId requis' }, { status: 400 });
  const id = crypto.randomUUID();
  const rows = await query(
    'insert into reviews (id,product_id,rating,title,text,author,created_at) values ($1,$2,$3,$4,$5,$6,$7) returning *',
    [id, b.productId, b.rating ?? 5, b.title ?? '', b.text ?? '', b.author ?? session.email, new Date().toISOString()]
  );
  return NextResponse.json(toReview(rows[0]));
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const row = await queryOne(
    'update reviews set is_published = $2 where id = $1 returning *',
    [b.id, b.isPublished !== false]
  );
  return NextResponse.json(toReview(row));
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  await query('delete from reviews where id = $1', [id]);
  return NextResponse.json({ ok: true });
}
