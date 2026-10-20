import { auth } from '@/lib/auth/server';
import { queryOne } from '@/lib/db';

export type SessionPayload = {
  uid: string;
  email: string;
  isAdmin: boolean;
};

export async function getSession(): Promise<SessionPayload | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;

  const uid = session.user.id;
  const email = session.user.email;

  const user = await queryOne<{ is_admin: boolean }>(
    'select is_admin from users where email = $1',
    [email]
  );

  return { uid, email, isAdmin: !!user?.is_admin };
}

export async function destroySession() {
  await auth.signOut();
}
