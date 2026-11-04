const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file, deps) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const m = { exports: {} };
  new Function('require','module','exports',code)(name => deps[name] || require(name), m, m.exports);
  return m.exports;
}
const totals = load('src/lib/order-totals.ts', {
  './db': { query: async () => [{ id: 'p', price: 100, stock: 5, status: 'active' }] },
  './site-settings-server': { getSiteSettings: async () => ({}) },
  './shipping': { getShippingQuote: () => ({ shippingCost: 0, isFreeShipping: true }) },
});
test('Quantities are finite positive integers', async () => {
  for (const quantity of [0, -1, 1.5, Infinity, NaN, '2'])
    assert.equal((await totals.computeOrderTotals([{ product: { id: 'p' }, quantity }], 'dakar')).itemsAreValid, false);
});
test('Duplicate product lines cannot exceed stock', async () => {
  const r = await totals.computeOrderTotals([3,3].map(quantity => ({ product: { id: 'p' }, quantity })), 'dakar');
  assert.ok(r.unavailableProductIds.includes('p'));
});
test('Price comes from the catalog and exact stock is accepted', async () => {
  const r = await totals.computeOrderTotals([{ product: { id: 'p', price: 1 }, quantity: 5 }], 'dakar');
  assert.equal(r.totalPrice, 500);
  assert.deepEqual(r.unavailableProductIds, []);
});
const { NextRequest } = require('next/server');
const guard = load('src/lib/public-form-guard.ts', { '@/lib/db': { queryOne: async () => ({ attempts: 1 }) } });
test('Public forms reject foreign origins, malformed JSON and oversized bodies', async () => {
  const req = (body, origin='https://shop.test') => new NextRequest('https://shop.test/api/contact', { method:'POST', headers:{origin}, body });
  assert.equal((await guard.readPublicForm(req('{}','https://foreign.test'),'contact',10,20)).response.status,403);
  assert.equal((await guard.readPublicForm(req('{'),'contact',10,20)).response.status,400);
  assert.equal((await guard.readPublicForm(req('x'.repeat(30)),'contact',10,20)).response.status,413);
  assert.deepEqual((await guard.readPublicForm(req('{"ok":true}'),'contact',10,20)).body,{ok:true});
});
test('Public forms fail closed on exhausted quota', async () => {
  const limited = load('src/lib/public-form-guard.ts', { '@/lib/db': { queryOne: async () => ({ attempts: 11 }) } });
  const req = new NextRequest('https://shop.test/api/contact',{method:'POST',headers:{origin:'https://shop.test'},body:'{}'});
  assert.equal((await limited.readPublicForm(req,'contact',10,20)).response.status,429);
});
const postCalls = [];
const orderRoute = load('src/app/api/orders/route.ts', {
  '@/lib/db': { query: async (sql, params) => { postCalls.push({sql, params}); return []; }, queryOne: async () => null },
  '@/lib/auth': { getSession: async () => null },
  '@/lib/public-form-guard': { readPublicForm: async req => ({body: await req.json()}) },
  '@/lib/order-totals': totals,
});
test('Order route rejects bad input and atomically saves server prices and an unpredictable ID', async () => {
  const req = body => new NextRequest('https://shop.test/api/orders',{method:'POST',headers:{origin:'https://shop.test'},body:JSON.stringify(body)});
  assert.equal((await orderRoute.POST(req({}))).status,400);
  const result = await orderRoute.POST(req({orderId:'chosen-id',customerInfo:{name:'Test',phone:'771234567',email:'',address:'Dakar'},deliveryMethod:'dakar',paymentMethod:'cod',items:[{product:{id:'p',price:1},quantity:2}]}));
  const body = await result.json();
  assert.match(body.id,/^DKB-[0-9a-f-]{36}$/);
  assert.notEqual(body.id,'chosen-id');
  assert.equal(postCalls.length,1);
  assert.equal(postCalls[0].params[4],200);
  const { PGlite } = require('@electric-sql/pglite');
  const db = new PGlite();
  await db.exec(`CREATE TABLE orders(id text primary key,order_id text,customer_info jsonb,items jsonb,total_price numeric,shipping_cost numeric,grand_total numeric,status text,created_at timestamptz,delivery_method text,payment_method text,admin_notes text,public_notes jsonb); CREATE TABLE public_orders(id text primary key,order_id text,status text,created_at timestamptz,status_history jsonb,public_notes jsonb);`);
  await db.query(postCalls[0].sql,postCalls[0].params);
  const rows = await db.query('SELECT status_history FROM public_orders');
  assert.equal(rows.rows[0].status_history[0].status,'pending');
  await db.close();
});
test('Public form database failures return a controlled unavailable response', async () => {
  const failing = load('src/lib/public-form-guard.ts', { '@/lib/db': { queryOne: async () => { throw Error('unavailable'); } } });
  const req = new NextRequest('https://shop.test/api/contact',{method:'POST',headers:{origin:'https://shop.test'},body:'{}'});
  assert.equal((await failing.readPublicForm(req,'contact',10,100)).response.status,503);
});
