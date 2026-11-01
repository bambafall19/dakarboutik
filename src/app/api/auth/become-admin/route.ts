import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  // Public merchant registration must never grant the first visitor administrator rights.
  if (!session.isAdmin && (!process.env.ADMIN_BOOTSTRAP_EMAIL || session.email.toLowerCase() !== process.env.ADMIN_BOOTSTRAP_EMAIL.toLowerCase())) {
    return NextResponse.json({ error: 'Accès réservé à l’administrateur.' }, { status: 403 });
  }

  const anyAdmin = await queryOne<{ id: string }>('select id from users where is_admin = true limit 1');
  if (anyAdmin && !session.isAdmin) {
    return NextResponse.json({ error: 'Un administrateur existe déjà.' }, { status: 403 });
  }

  const user = await queryOne<{ id: string }>(
    `insert into users (email, password_hash, is_admin)
     values ($1, '', true)
     on conflict (email) do update set is_admin = true
     returning id`,
    [session.email]
  );

  return NextResponse.json({ ok: true, isAdmin: true, id: user?.id ?? session.uid });
}
