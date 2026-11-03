import { auth } from '@/lib/auth/server';
import { queryOne } from '@/lib/db';
import { phoneSession, clearPhoneSession } from '@/lib/merchant-phone-auth';

export type SessionPayload = {
  uid: string;
  email: string;
  isAdmin: boolean;
  phone?: string;
  method?: "phone";
};

export async function getSession(): Promise<SessionPayload | null> {
  const merchant = await phoneSession();
  if (merchant) return merchant;
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
  await clearPhoneSession();
  await auth.signOut();
}
