import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import type { PublicOrder } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const row = await queryOne<any>('select * from public_orders where id=$1', [id]);
  if (!row) return NextResponse.json(null, { status: 404 });
  const order: PublicOrder = {
    id: row.id,
    orderId: row.order_id,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    statusHistory: row.status_history ?? [],
    publicNotes: row.public_notes ?? [],
  };
  return NextResponse.json(order);
}
