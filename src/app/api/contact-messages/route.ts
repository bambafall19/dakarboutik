import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const rows = await query('select * from contact_messages order by created_at desc');
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name ?? '',
      email: r.email ?? '',
      subject: r.subject ?? '',
      message: r.message ?? '',
      isRead: !!r.is_read,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    }))
  );
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const message = typeof b.message === 'string' ? b.message.trim() : '';
  const email = typeof b.email === 'string' ? b.email.trim() : '';

  if (!message) return NextResponse.json({ error: 'Le message est requis.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Veuillez entrer un email valide.' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await queryOne(
    'insert into contact_messages (id,name,email,subject,message) values ($1,$2,$3,$4,$5) returning id',
    [id, b.name ?? '', email, b.subject ?? '', message]
  );

  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  await queryOne('update contact_messages set is_read = $2 where id = $1 returning id', [
    b.id,
    b.isRead !== false,
  ]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  await query('delete from contact_messages where id = $1', [id]);
  return NextResponse.json({ ok: true });
}
