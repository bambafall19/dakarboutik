import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { hash } from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { consumePhoneLimit } from '@/lib/merchant-phone-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
const response = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== req.nextUrl.origin) return response({ error: 'Origine refusée.' }, 403);
  try {
    const raw = await req.text();
    if (raw.length > 2048) return response({ error: 'Requête trop longue.' }, 413);
    const body = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: z.string().min(10).max(72).refine(p => Buffer.byteLength(p) <= 72) }).strict().safeParse(JSON.parse(raw));
    if (!body.success) return response({ error: 'Lien invalide ou mot de passe incorrect : 10 caractères minimum, 72 octets maximum.' }, 400);
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const digest = createHash('sha256').update(body.data.token).digest('hex');
    if (!await consumePhoneLimit(`access-redeem-ip:${ip}`, 10, 900) || !await consumePhoneLimit(`access-redeem-token:${digest}`, 5, 900)) return response({ error: 'Trop de tentatives. Réessayez dans 15 minutes ou demandez un nouveau lien.' }, 429);
    const passwordHash = await hash(body.data.password, 12);
    const result = await queryOne<{ ok: boolean }>('select consume_merchant_access_link($1,$2) as ok', [digest, passwordHash]);
    if (!result?.ok) return response({ error: 'Ce lien est expiré, déjà utilisé ou ne correspond plus à la boutique. Demandez un nouveau lien à DakarBoutik.' }, 400);
    return response({ ok: true });
  } catch {
    return response({ error: 'Réinitialisation indisponible. Réessayez sans communiquer votre mot de passe.' }, 503);
  }
}
