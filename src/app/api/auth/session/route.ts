import { NextResponse } from 'next/server';
import { destroySession, getSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const user = await queryOne<{ id: string; email: string; is_admin: boolean }>(
    'select id, email, is_admin from users where email = $1',
    [session.email]
  );
  if (!user) {
    return NextResponse.json({ user: { id: session.uid, email: session.email, isAdmin: false } });
  }
  return NextResponse.json({ user: { id: user.id, email: user.email, isAdmin: user.is_admin } });
}
