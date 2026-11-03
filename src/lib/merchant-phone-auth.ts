import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { query, queryOne } from "@/lib/db";

export const phoneCookie = process.env.NODE_ENV === "production" ? "__Host-merchant-session" : "merchant-session";
const lifetime = 60 * 60 * 24 * 7;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export function normalizePhone(value: string): string | null {
  const clean = value.trim().replace(/[ ()-]/g, "").replace(/^00/, "+");
  const phone = /^\d{9}$/.test(clean) ? `+221${clean}` : clean;
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}
export async function phoneSession() {
  const token = (await cookies()).get(phoneCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const row = await queryOne<{ id: string; phone: string }>(
    `select a.id,a.phone from merchant_phone_sessions s join merchant_phone_accounts a on a.id=s.account_id
     where s.token_hash=$1 and s.expires_at>now()`, [digest(token)]);
  // Contact email is unverified profile data, NEVER an identity or an admin lookup key.
  return row ? { uid: row.id, email: "", phone: row.phone, isAdmin: false, method: "phone" as const } : null;
}
export async function clearPhoneSession() {
  const jar = await cookies();
  const token = jar.get(phoneCookie)?.value;
  if (token) await query("delete from merchant_phone_sessions where token_hash=$1", [digest(token)]);
  jar.set(phoneCookie, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}
async function startSession(id: string) {
  await clearPhoneSession();
  const token = randomBytes(32).toString("hex");
  await query("insert into merchant_phone_sessions(token_hash,account_id,expires_at) values($1,$2,now()+interval '7 days')", [digest(token), id]);
  (await cookies()).set(phoneCookie, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: lifetime });
}
export async function consumePhoneLimit(key: string, maximum: number, seconds: number) {
  const row = await queryOne<{ attempts: number }>(
    `insert into merchant_auth_limits(key,attempts,expires_at) values($1,1,now()+$2*interval '1 second')
     on conflict(key) do update set attempts=case when merchant_auth_limits.expires_at<=now() then 1 else merchant_auth_limits.attempts+1 end,
     expires_at=case when merchant_auth_limits.expires_at<=now() then excluded.expires_at else merchant_auth_limits.expires_at end returning attempts`, [digest(key), seconds]);
  return !!row && row.attempts <= maximum;
}
// A fixed cost-12 hash keeps unknown-user and wrong-password comparisons comparable.
const dummyHash = "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";
export async function authenticatePhone(body: Record<string, unknown>) {
  const phone = typeof body.phone === "string" ? normalizePhone(body.phone) : null;
  const password = typeof body.password === "string" ? body.password : "";
  if (!phone || password.length < 6 || Buffer.byteLength(password, "utf8") > 72)
    return { status: 400, error: "Vérifiez le numéro et le mot de passe (6 caractères minimum, 72 octets maximum)." };
  if (!await consumePhoneLimit(`phone:${phone}`, 10, 900))
    return { status: 429, error: "Trop de tentatives. Réessayez dans 15 minutes." };
  let id: string;
  if (body.action === "register-phone") {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!name || name.length > 100 || email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
      return { status: 400, error: "Vérifiez votre nom et l’adresse e-mail facultative." };
    const passwordHash = await hash(password, 12);
    const row = await queryOne<{ id: string }>(
      `insert into merchant_phone_accounts(id,phone,name,contact_email,password_hash) values($1,$2,$3,$4,$5)
       on conflict(phone) do nothing returning id`, [randomUUID(), phone, name, email || null, passwordHash]);
    if (!row) return { status: 409, error: "Inscription impossible avec ce numéro. Essayez de vous connecter ou contactez l’assistance." };
    id = row.id;
  } else {
    const row = await queryOne<{ id: string; password_hash: string }>("select id,password_hash from merchant_phone_accounts where phone=$1", [phone]);
    const correct = await compare(password, row?.password_hash || dummyHash);
    if (!row || !correct) return { status: 401, error: "Numéro ou mot de passe incorrect." };
    id = row.id;
  }
  await startSession(id);
  return { status: 200 };
}

export async function changePhonePassword(oldPassword: unknown, newPassword: unknown) {
  const session = await phoneSession();
  if (!session) return { status: 401, error: "Connectez-vous avec votre téléphone." };
  if (typeof oldPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 6 || Buffer.byteLength(newPassword) > 72 || Buffer.byteLength(oldPassword) > 72)
    return { status: 400, error: "Le nouveau mot de passe doit contenir au moins 6 caractères (72 octets maximum)." };
  if (!await consumePhoneLimit(`password-change:${session.uid}`, 5, 900)) return { status: 429, error: "Trop de tentatives. Réessayez dans 15 minutes." };
  const row = await queryOne<{ password_hash: string }>("select password_hash from merchant_phone_accounts where id=$1", [session.uid]);
  if (!row || !await compare(oldPassword, row.password_hash)) return { status: 401, error: "Mot de passe actuel incorrect." };
  const nextHash = await hash(newPassword, 12);
  const changed = await queryOne<{ id: string }>(`with changed as (
    update merchant_phone_accounts set password_hash=$1 where id=$2 and password_hash=$3 returning id
  ), revoked as (delete from merchant_phone_sessions where account_id in(select id from changed)) select id from changed`, [nextHash, session.uid, row.password_hash]);
  if (!changed) return { status: 409, error: "Le compte a changé. Reconnectez-vous." };
  await startSession(session.uid);
  return { status: 200 };
}
