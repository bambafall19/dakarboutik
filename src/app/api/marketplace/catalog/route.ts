import { NextResponse } from 'next/server';
import { publicMarketplace } from '@/lib/marketplace-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Same approved shops and listings as the public server-rendered catalogue.
    return NextResponse.json(await publicMarketplace(), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'La recherche est temporairement indisponible.' }, { status: 503 });
  }
}
