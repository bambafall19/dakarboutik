import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';
import { getSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { consumePhoneLimit } from '@/lib/merchant-phone-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
const response = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== req.nextUrl.origin) return response({ error: 'Origine refusée.' }, 403);
  const session = await getSession();
  if (!session?.isAdmin) return response({ error: 'Accès refusé.' }, 403);
  try {
    const raw = await req.text();
    if (raw.length > 1024) return response({ error: 'Requête trop longue.' }, 413);
    const body = z.object({ shopId: z.string().uuid(), verified: z.literal(true) }).strict().safeParse(JSON.parse(raw));
    if (!body.success) return response({ error: 'Confirmez la vérification du propriétaire.' }, 400);
    if (!await consumePhoneLimit(`access-link:${session.uid}:${body.data.shopId}`, 5, 900)) return response({ error: 'Trop de demandes. Réessayez dans 15 minutes.' }, 429);
    const token = randomBytes(32).toString('hex');
    const digest = createHash('sha256').update(token).digest('hex');
    const result = await queryOne<{ phone: string | null }>('select issue_merchant_access_link($1,$2,$3) as phone', [body.data.shopId, digest, session.uid]);
    if (!result?.phone) return response({ error: 'Accès non préparé : vérifiez le numéro, la suspension ou son rattachement à une autre boutique.' }, 409);
    // Fragment stays out of web-server logs and WhatsApp link previews.
    return response({ url: `${req.nextUrl.origin}/acces-boutique#${token}`, phone: result.phone, expiresInMinutes: 30 });
  } catch {
    return response({ error: 'Impossible de préparer cet accès. Actualisez ou contactez l’administrateur technique.' }, 503);
  }
}
