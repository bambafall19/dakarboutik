import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function toFaq(r: any) {
  return { id: r.id, question: r.question, answer: r.answer, order: r.order ?? 0 };
}

export async function GET() {
  const rows = await query('select * from faq order by "order" asc');
  return NextResponse.json(rows.map(toFaq));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const b = await req.json();
  const id = b.id || crypto.randomUUID();
  const rows = await query(
    'insert into faq (id,question,answer,"order") values ($1,$2,$3,$4) returning *',
    [id, b.question, b.answer, b.order ?? 0]
  );
  return NextResponse.json(toFaq(rows[0]));
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const rows = await query(
    'update faq set question=$2, answer=$3, "order"=$4 where id=$1 returning *',
    [b.id, b.question, b.answer, b.order ?? 0]
  );
  return NextResponse.json(toFaq(rows[0]));
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  await query('delete from faq where id = $1', [id]);
  return NextResponse.json({ ok: true });
}
