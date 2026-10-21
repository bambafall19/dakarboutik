import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type MediaItem = {
  id: string;
  name: string;
  url: string;
  kind: string;
  createdAt: string;
  size?: number;
  contentType?: string;
};

function toMedia(r: any): MediaItem {
  return {
    id: r.id,
    name: r.name ?? '',
    url: r.url,
    kind: r.kind ?? 'image',
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    size: r.size ?? undefined,
    contentType: r.content_type ?? undefined,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const [library, products, banners] = await Promise.all([
    query('select * from media order by created_at desc'),
    query("select id, title, images from products where jsonb_array_length(images) > 0"),
    query("select id, title, images from banners where jsonb_array_length(images) > 0"),
  ]);

  const used: Array<MediaItem & { usage: string; usageCount: number }> = [];

  for (const p of products) {
    const images = Array.isArray(p.images) ? p.images : [];
    images.forEach((img: any, index: number) => {
      const url = img?.imageUrl;
      if (!url) return;
      used.push({
        id: `product-${p.id}-${index}`,
        name: `${p.title}${images.length > 1 ? ` (${index + 1})` : ''}`,
        url,
        kind: 'image',
        createdAt: '',
        usage: 'Produit',
        usageCount: 1,
      });
    });
  }

  for (const b of banners) {
    const images = Array.isArray(b.images) ? b.images : [];
    images.forEach((img: any, index: number) => {
      const url = img?.imageUrl;
      if (!url) return;
      used.push({
        id: `banner-${b.id}-${index}`,
        name: `${b.title || 'Bannière'}${images.length > 1 ? ` (${index + 1})` : ''}`,
        url,
        kind: 'image',
        createdAt: '',
        usage: 'Bannière',
        usageCount: 1,
      });
    });
  }

  return NextResponse.json({
    library: library.map(toMedia),
    used,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const b = await req.json();
  const url = typeof b.url === 'string' ? b.url.trim() : '';
  if (!url) return NextResponse.json({ error: 'URL requise.' }, { status: 400 });

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "L'URL n'est pas valide." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const row = await queryOne(
    `insert into media (id, name, url, kind) values ($1, $2, $3, $4)
     on conflict (url) do update set name = excluded.name
     returning *`,
    [id, b.name ?? '', url, b.kind ?? 'image']
  );
  return NextResponse.json(toMedia(row));
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  await query('delete from media where id = $1', [id]);
  return NextResponse.json({ ok: true });
}
