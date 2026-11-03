import { NextRequest, NextResponse } from 'next/server';
import { destroySession, getSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { authenticatePhone, consumePhoneLimit, changePhonePassword } from '@/lib/merchant-phone-auth';

export async function POST(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  try {
    const raw = await req.text();
    if (raw.length > 4096) return NextResponse.json({ error: "Requête trop longue." }, { status: 413 });
    const body = raw ? JSON.parse(raw) : { action: "logout" };
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    if (body.action === "logout") {
      await destroySession();
      return NextResponse.json({ ok: true });
    }
    if (body.action === "change-phone-password") {
      const result = await changePhonePassword(body.oldPassword, body.newPassword);
      return NextResponse.json(result.error ? { error: result.error } : { ok: true }, { status: result.status });
    }
    if (!["register-phone", "login-phone"].includes(body.action)) return NextResponse.json({ error: "Action invalide." }, { status: 400 });
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const register = body.action === "register-phone";
    if (!await consumePhoneLimit(`${register ? "registration" : "login"}:${ip}`, register ? 5 : 40, register ? 3600 : 900))
      return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
    const result = await authenticatePhone(body);
    return NextResponse.json(result.error ? { error: result.error } : { ok: true }, { status: result.status });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    return NextResponse.json({ error: "Connexion par téléphone temporairement indisponible. Réessayez plus tard." }, { status: 503 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  if (session.method === "phone") return NextResponse.json({ user: { id: session.uid, email: "", phone: session.phone, isAdmin: false } });
  const user = await queryOne<{ id: string; email: string; is_admin: boolean }>(
    'select id, email, is_admin from users where email = $1',
    [session.email]
  );
  if (!user) {
    return NextResponse.json({ user: { id: session.uid, email: session.email, isAdmin: false } });
  }
  return NextResponse.json({ user: { id: user.id, email: user.email, isAdmin: user.is_admin } });
}
