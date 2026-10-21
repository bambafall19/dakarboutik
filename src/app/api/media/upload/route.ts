import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MAX_SIZE = 4 * 1024 * 1024; // 4 Mo
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Fichier illisible.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Format non supporté. Utilisez JPG, PNG, WEBP, AVIF, GIF ou SVG.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'Fichier trop volumineux (4 Mo maximum).' },
      { status: 400 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const id = `med_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const url = `/api/media/file/${id}`;
  const rawName = formData.get('name');
  const name = (typeof rawName === 'string' && rawName.trim()) || file.name || 'Média';

  await query(
    `insert into media (id, name, url, kind, data, content_type, size, original_name)
     values ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, name, url, 'image', bytes, file.type, file.size, file.name]
  );

  return NextResponse.json({
    id,
    name,
    url,
    kind: 'image',
    size: file.size,
    contentType: file.type,
    createdAt: new Date().toISOString(),
  });
}
