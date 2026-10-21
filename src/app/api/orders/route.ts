import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { computeOrderTotals } from '@/lib/order-totals';
import type { DeliveryMethod } from '@/lib/shipping';
import type { CartItem, Order, PublicOrder } from '@/lib/types';

export const dynamic = 'force-dynamic';

function toOrder(r: any): Order {
  return {
    id: r.id,
    orderId: r.order_id,
    customerInfo: r.customer_info ?? {},
    items: r.items ?? [],
    totalPrice: Number(r.total_price),
    shippingCost: Number(r.shipping_cost),
    grandTotal: Number(r.grand_total),
    status: r.status,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    deliveryMethod: r.delivery_method,
    paymentMethod: r.payment_method,
    adminNotes: r.admin_notes ?? undefined,
    publicNotes: r.public_notes ?? [],
  };
}

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const rows = await query('select * from orders order by created_at desc');
  return NextResponse.json(rows.map(toOrder));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const orderId = b.orderId || `DKB-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  if (!/^[A-Za-z0-9_-]{4,48}$/.test(String(orderId))) {
    return NextResponse.json({ error: 'Numéro de commande invalide.' }, { status: 400 });
  }
  const createdAt = new Date().toISOString();
  const deliveryMethod: DeliveryMethod = b.deliveryMethod === 'hors-dakar' ? 'hors-dakar' : 'dakar';
  const items: CartItem[] = Array.isArray(b.items) ? b.items : [];

  const totals = await computeOrderTotals(items, deliveryMethod);

  if (!totals.itemsAreValid) {
    return NextResponse.json(
      { error: 'Panier invalide : un des produits n’est plus disponible. Merci de vérifier votre panier.' },
      { status: 400 }
    );
  }

  if (totals.unavailableProductIds.length > 0) {
    return NextResponse.json(
      { error: 'Panier invalide : un des produits n’est plus disponible. Merci de vérifier votre panier.' },
      { status: 400 }
    );
  }

  try {
    await query(
      `insert into orders (id,order_id,customer_info,items,total_price,shipping_cost,grand_total,status,created_at,delivery_method,payment_method,admin_notes,public_notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [orderId, orderId, JSON.stringify(b.customerInfo ?? {}), JSON.stringify(totals.sanitizedItems), totals.totalPrice,
       totals.shippingCost, totals.grandTotal, 'pending', createdAt, deliveryMethod,
       b.paymentMethod ?? null, null, JSON.stringify([])]
    );
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json(
        { error: 'Une commande avec ce numéro existe déjà.' },
        { status: 409 }
      );
    }
    throw err;
  }

  await query(
    `insert into public_orders (id,order_id,status,created_at,status_history,public_notes)
     values ($1,$2,$3,$4,$5,$6)
     on conflict (id) do nothing`,
    [orderId, orderId, 'pending', createdAt, JSON.stringify([{ status: 'pending', date: createdAt }]), JSON.stringify([])]
  );

  return NextResponse.json({ id: orderId });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;
  if (b.status !== undefined) { fields.push(`status=$${i++}`); values.push(b.status); }
  if (b.adminNotes !== undefined) { fields.push(`admin_notes=$${i++}`); values.push(b.adminNotes); }
  if (b.publicNotes !== undefined) { fields.push(`public_notes=$${i++}`); values.push(JSON.stringify(b.publicNotes)); }
  values.push(b.id);
  await query(`update orders set ${fields.join(', ')} where id=$${i}`, values);

  if (b.status !== undefined) {
    await queryOne(
      `update public_orders set status=$2, status_history=status_history || $3::jsonb where id=$1 returning id`,
      [b.id, b.status, JSON.stringify([{ status: b.status, date: new Date().toISOString() }])]
    );
  }
  if (b.publicNote) {
    await queryOne(
      `update public_orders set public_notes=public_notes || $2::jsonb where id=$1 returning id`,
      [b.id, JSON.stringify([{ date: new Date().toISOString(), note: b.publicNote }])]
    );
    await queryOne(
      `update orders set public_notes=public_notes || $2::jsonb where id=$1 returning id`,
      [b.id, JSON.stringify([{ date: new Date().toISOString(), note: b.publicNote }])]
    );
  }
  const row = await queryOne('select * from orders where id=$1', [b.id]);
  return NextResponse.json(row ? toOrder(row) : null);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  await query('delete from orders where id=$1', [id]);
  await query('delete from public_orders where id=$1', [id]);
  return NextResponse.json({ ok: true });
}
