import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { queryOne } from '@/lib/db';

export async function readPublicForm(req: NextRequest, purpose: string, maximum: number, maxBytes: number) {
  if (req.headers.get('origin') !== req.nextUrl.origin)
    return { response: NextResponse.json({ error: 'Origine refusée.' }, { status: 403 }) };
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const key = createHash('sha256').update(`public-form:${purpose}:${ip}`).digest('hex');
    const count = await queryOne<{ attempts: number }>(
      `insert into merchant_auth_limits(key,attempts,expires_at) values($1,1,now()+interval '15 minutes')
       on conflict(key) do update set attempts=case when merchant_auth_limits.expires_at<=now() then 1 else merchant_auth_limits.attempts+1 end,
       expires_at=case when merchant_auth_limits.expires_at<=now() then excluded.expires_at else merchant_auth_limits.expires_at end returning attempts`, [key]);
    if (!count || count.attempts > maximum)
      return { response: NextResponse.json({ error: 'Trop de demandes. Réessayez dans 15 minutes.' }, { status: 429, headers: { 'Retry-After': '900' } }) };
    const reader = req.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return { response: NextResponse.json({ error: 'Demande trop volumineuse.' }, { status: 413 }) };
      }
      chunks.push(part.value);
    }
    try { return { body: JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown }; }
    catch { return { response: NextResponse.json({ error: 'Demande invalide.' }, { status: 400 }) }; }
  } catch {
    return { response: NextResponse.json({ error: 'Service temporairement indisponible.' }, { status: 503 }) };
  }
}
