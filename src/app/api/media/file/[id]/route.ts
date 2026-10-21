import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const row = await queryOne<any>(
    'select data, content_type, size, name from media where id = $1 and data is not null',
    [id]
  );

  if (!row) {
    return NextResponse.json({ error: 'Média introuvable.' }, { status: 404 });
  }

  const bytes = row.data instanceof Uint8Array ? row.data : new Uint8Array(row.data);
  const contentType = row.content_type || 'application/octet-stream';

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="${encodeURIComponent(row.name || id)}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
