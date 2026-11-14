import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { buildOrderMessage, buildWhatsAppUrl, DELIVERY_LABELS, getWhatsAppNumber } from '@/lib/order-channels';
import { getSiteSettings } from '@/lib/site-settings-server';
import { computeOrderTotals } from '@/lib/order-totals';
import { readPublicForm } from '@/lib/public-form-guard';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type { DeliveryMethod } from '@/lib/shipping';
import type { CartItem, Order } from '@/lib/types';

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
    archivedAt: r.archived_at ? new Date(r.archived_at).toISOString() : undefined,
    adminNotes: r.admin_notes ?? undefined,
    publicNotes: r.public_notes ?? [],
  };
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const includeArchived = req.nextUrl.searchParams.get('includeArchived') === 'true';
  const rows = await query(
    'select * from orders where ($1::boolean or archived_at is null) order by created_at desc',
    [includeArchived]
  );
  return NextResponse.json(rows.map(toOrder));
}

export async function POST(req: NextRequest) {
  const input = await readPublicForm(req, 'order', 15, 262144);
  if (input.response) return input.response;
  const parsed = z.object({
    testOrder: z.boolean().optional(),
    channel: z.literal("whatsapp").optional(),
    orderId: z.string().regex(/^[A-Za-z0-9_-]{4,48}$/).optional(),
    customerInfo: z.object({ name: z.string().trim().min(1).max(120),
      phone: z.string().trim().min(7).max(30), email: z.union([z.string().email().max(254), z.literal('')]).default(''),
      address: z.string().trim().min(1).max(500), city: z.string().trim().max(120).default('') }),
    deliveryMethod: z.enum(['dakar', 'hors-dakar']), paymentMethod: z.enum(['cod', 'mobile_money']),
    items: z.array(z.object({ id: z.string().max(200).optional(),
      product: z.object({ id: z.string().min(1).max(200) }), quantity: z.number().int().min(1).max(10000),
      selectedVariants: z.array(z.object({ name: z.string().max(100), value: z.string().max(100) })).max(20).optional()
    })).min(1).max(100),
  }).safeParse(input.body);
  if (!parsed.success) return NextResponse.json({ error: 'Vérifiez les coordonnées et les quantités de votre commande.' }, { status: 400 });
  const b = parsed.data;
  const isTest = b.testOrder === true;
  const testEmail = process.env.ORDER_TEST_EMAIL?.trim().toLowerCase();
  if (isTest && (!(await getSession())?.isAdmin || !testEmail || b.customerInfo.email.toLowerCase() !== testEmail || b.paymentMethod !== 'cod')) {
    return NextResponse.json({ error: 'Commande de test non autorisée.' }, { status: 403 });
  }
  const whatsAppNumber = b.channel === 'whatsapp' ? getWhatsAppNumber(await getSiteSettings()) : null;
  if (b.channel === 'whatsapp' && !whatsAppNumber) {
    return NextResponse.json({ error: 'La commande par WhatsApp est indisponible.' }, { status: 400 });
  }
  const status = isTest ? 'cancelled' : 'pending';
  const orderId = `${isTest ? 'DKB-TEST' : 'DKB'}-${randomUUID()}`;
  const createdAt = new Date().toISOString();
  const deliveryMethod: DeliveryMethod = b.deliveryMethod === 'hors-dakar' ? 'hors-dakar' : 'dakar';
  const items = b.items as CartItem[];

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
      `with saved as (insert into orders (id,order_id,customer_info,items,total_price,shipping_cost,grand_total,status,created_at,delivery_method,payment_method,admin_notes,public_notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id,order_id,status,created_at)
       insert into public_orders (id,order_id,status,created_at,status_history,public_notes)
       select id,order_id,status,created_at,jsonb_build_array(jsonb_build_object('status',status,'date',created_at)),'[]'::jsonb from saved`,
      [orderId, orderId, JSON.stringify(b.customerInfo ?? {}), JSON.stringify(totals.sanitizedItems), totals.totalPrice,
       isTest ? 0 : totals.shippingCost, isTest ? 0 : totals.grandTotal, status, createdAt, deliveryMethod,
       b.paymentMethod ?? null, isTest ? 'TEST INTERNE — aucun paiement ni livraison.' : null, JSON.stringify([])]
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

  const key = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  const email = b.customerInfo.email;
  let confirmationEmail = 'skipped';
  if (email && key && from && b.channel !== 'whatsapp') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `order-confirmation/${orderId}`,
        },
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({
          from,
          to: [email],
          subject: `${isTest ? '[TEST] ' : ''}DakarBoutik — Commande ${orderId}`,
          text: isTest
            ? `Commande de test ${orderId} enregistrée. Aucun paiement ni livraison.`
            : `DakarBoutik a bien reçu votre commande ${orderId}. Montant total : ${totals.grandTotal.toLocaleString('fr-FR')} FCFA.\nSuivez votre commande sur https://dakarboutik.net/suivi avec cette référence.`,
        }),
      });
      confirmationEmail = response.ok ? 'accepted' : 'failed';
    } catch {
      confirmationEmail = 'failed';
    }
    if (confirmationEmail === 'failed') console.error('Order confirmation email failed', orderId);
  }
  const whatsappUrl = whatsAppNumber ? buildWhatsAppUrl(whatsAppNumber, [
    `*Référence :* ${orderId}`,
    `Suivre la commande : https://dakarboutik.net/suivi/${encodeURIComponent(orderId)}`,
    buildOrderMessage({
      items: totals.sanitizedItems.map(item => ({
        title: item.product.title,
        quantity: item.quantity,
        unitPrice: item.product.price,
        options: item.selectedVariants?.map(variant => variant.value).join(', '),
      })),
      subtotal: totals.totalPrice,
      deliveryLabel: DELIVERY_LABELS[deliveryMethod],
      shippingCost: isTest ? undefined : totals.shippingCost,
      total: isTest ? undefined : totals.grandTotal,
    }),
  ].join('\n\n')) : undefined;
  return NextResponse.json({ id: orderId, confirmationEmail, whatsappUrl });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  if (b.status !== undefined) {
    const status = z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']).safeParse(b.status);
    if (!status.success) return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });

    const row = await queryOne(
      `with locked_order as materialized (
         select * from orders where id = $1 for update
       ), charge as (
         select items from locked_order
         where $2 = 'paid' and status <> 'paid' and archived_at is null
           and order_id not like 'DKB-TEST-%'
           -- Cette vente a déjà été déduite manuellement.
           and id <> 'DKB-ed0b3331-f078-4f65-a05c-92164ad0a6f0'
           and not (items @> '[{"stockDeducted":true}]'::jsonb)
       ), requested as (
         select item->'product'->>'id' as id, sum((item->>'quantity')::integer) as quantity
         from charge cross join lateral jsonb_array_elements(items) as lines(item)
         group by 1
       ), locked_products as materialized (
         select p.id, p.stock, r.quantity from products p join requested r on r.id = p.id
         order by p.id for update of p
       ), allowed as (
         select not exists (select 1 from charge) or (
           exists (select 1 from requested)
           and (select count(*) from locked_products) = (select count(*) from requested)
           and not exists (select 1 from locked_products where quantity is null or quantity <= 0 or stock < quantity)
         ) as ok
       ), deducted as (
         update products p set stock = p.stock - l.quantity::integer
         from locked_products l, allowed a where p.id = l.id and a.ok returning p.id
       ), saved as (
         update orders o set status = $2,
           items = case when exists (select 1 from deducted)
             then jsonb_set(l.items, '{0,stockDeducted}', 'true'::jsonb) else l.items end
         from locked_order l, allowed a where o.id = l.id and a.ok returning o.*, l.status as previous_status
       ), tracked as (
         update public_orders p set status = s.status,
           status_history = p.status_history || jsonb_build_array(jsonb_build_object('status', s.status, 'date', $3::text))
         from saved s where p.id = s.id and s.status <> s.previous_status
       )
       select (select row_to_json(saved) from saved) as saved,
              exists (select 1 from locked_order) as found`,
      [b.id, status.data, new Date().toISOString()]
    );
    if (!row?.found) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    if (!row.saved) return NextResponse.json({ error: 'Stock insuffisant ou produit introuvable. Le statut de la commande est inchangé.' }, { status: 409 });
    return NextResponse.json(toOrder(row.saved));
  }

  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;
  if (b.adminNotes !== undefined) { fields.push(`admin_notes=$${i++}`); values.push(b.adminNotes); }
  if (b.publicNotes !== undefined) { fields.push(`public_notes=$${i++}`); values.push(JSON.stringify(b.publicNotes)); }
  values.push(b.id);
  if (fields.length) await query(`update orders set ${fields.join(', ')} where id=$${i}`, values);
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

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  const parsed = z.object({ id: z.string().min(1).max(200), archived: z.boolean() })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Demande invalide.' }, { status: 400 });
  const { id, archived } = parsed.data;
  const row = await queryOne(
    `update orders
     set archived_at = case when $2::boolean then coalesce(archived_at, now()) else null end
     where id = $1 returning *`,
    [id, archived]
  );
  if (!row) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
  return NextResponse.json(toOrder(row));
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
