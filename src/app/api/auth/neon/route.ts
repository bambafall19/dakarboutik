import { NextRequest, NextResponse } from 'next/server';
import { getNeonAuthHealth, verifyNeonAuthToken } from '@/lib/neon-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = await getNeonAuthHealth();
  return NextResponse.json(health);
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Bearer token requis.' }, { status: 400 });
  }
  const claims = await verifyNeonAuthToken(token);
  if (!claims) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  return NextResponse.json({ valid: true, sub: claims.sub, email: claims.email ?? null });
}
