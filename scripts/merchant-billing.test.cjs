const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const {PGlite}=require('@electric-sql/pglite');
const {NextRequest}=require('next/server');
function loader(deps){const cache={};function load(file){if(cache[file])return cache[file];const mod={exports:{}};cache[file]=mod.exports;const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function('require','module','exports',code)(name=>name in deps?deps[name]:name==='server-only'?{}:name.startsWith('@/')?load(path.join('src',name.slice(2))+'.ts'):name.startsWith('.')?load(path.resolve(path.dirname(file),name)+'.ts'):require(name),mod,mod.exports);cache[file]=mod.exports;return mod.exports;}return load;}
test('Billing requests isolate owners, ignore client prices and require verified admin payment; activation is idempotent',async()=>{
 const db=new PGlite();let session=null;const previous=process.env.MARKETPLACE_BILLING_ENABLED;
 try{
  await db.exec(fs.readFileSync('scripts/marketplace.sql','utf8'));
  const shop=crypto.randomUUID(),other=crypto.randomUUID();
  await db.query("insert into marketplace_shops(id,owner_id,profile,status) values($1,'merchant','{\"name\":\"Shop\"}','approved')",[shop]);
  const migration=fs.readFileSync('scripts/merchant-billing.sql','utf8');await db.exec(migration);await db.exec(migration);
  assert.equal((await db.query('select state from marketplace_memberships where shop_id=$1',[shop])).rows[0].state,'legacy');
  await db.query("insert into marketplace_shops(id,owner_id,profile,status) values($1,'other','{\"name\":\"Other\"}','approved')",[other]);
  assert.equal((await db.query('select state from marketplace_memberships where shop_id=$1',[other])).rows[0].state,'inactive');
  const adapter={query:async(sql,p=[])=>(await db.query(sql,p)).rows,queryOne:async(sql,p=[])=>(await db.query(sql,p)).rows[0]??null};
  const load=loader({'@/lib/db':adapter,'@/lib/auth':{getSession:async()=>session}});
  const api=load('src/app/api/marketplace/billing/route.ts');
  const post=(b,origin='https://test.shop')=>api.POST(new NextRequest('https://test.shop/api/marketplace/billing',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(b)}));
  process.env.MARKETPLACE_BILLING_ENABLED='true';
  assert.equal((await post({action:'request'})).status,401);
  session={uid:'merchant',isAdmin:false};
  assert.equal((await post({action:'request'},'https://evil.test')).status,403);
  const input={action:'request',planId:'starter',visibility:'featured7',price:1,shopId:other,note:'Publicité le mois prochain'};
  assert.equal((await post(input)).status,200);
  assert.equal((await post(input)).status,409);
  const req=(await db.query('select * from marketplace_plan_requests')).rows[0];assert.equal(req.shop_id,shop);assert.equal(req.price_fcfa,2000);
  assert.equal((await post({action:'approve',id:req.id,paid:2000,reference:'PAY-TEST',confirmed:true})).status,403);
  session={uid:'other',isAdmin:false};assert.equal((await (await api.GET(new NextRequest('https://test.shop/api/marketplace/billing'))).json()).requests.length,0);
  session={uid:'admin',isAdmin:true};
  assert.equal((await post({action:'approve',id:req.id,paid:1,reference:'PAY-TEST',confirmed:true})).status,409);
  assert.equal((await post({action:'approve',id:req.id,paid:2000,reference:'PAY-TEST',confirmed:false})).status,400);
  assert.equal((await post({action:'approve',id:req.id,paid:2000,reference:'PAY-TEST',confirmed:true})).status,200);
  const expiry=(await db.query('select valid_until from marketplace_memberships where shop_id=$1',[shop])).rows[0].valid_until;
  assert.equal((await post({action:'approve',id:req.id,paid:2000,reference:'PAY-TEST',confirmed:true})).status,409);
  assert.equal(String((await db.query('select valid_until from marketplace_memberships where shop_id=$1',[shop])).rows[0].valid_until),String(expiry));
  assert.equal((await db.query('select sponsored_until from marketplace_shops where id=$1',[shop])).rows[0].sponsored_until,null);
  session={uid:'merchant',isAdmin:false};assert.equal((await post(input)).status,200);
  const renewal=(await db.query("select id from marketplace_plan_requests where status='pending'")).rows[0];
  session={uid:'admin',isAdmin:true};assert.equal((await post({action:'approve',id:renewal.id,paid:2000,reference:'pay-test',confirmed:true})).status,409);
  assert.equal(String((await db.query('select valid_until from marketplace_memberships where shop_id=$1',[shop])).rows[0].valid_until),String(expiry));
  assert.equal((await post({action:'approve',id:renewal.id,paid:2000,reference:'PAY-RENEWAL',confirmed:true})).status,200);
  assert.ok(new Date((await db.query('select valid_until from marketplace_memberships where shop_id=$1',[shop])).rows[0].valid_until)>new Date(expiry));
  process.env.MARKETPLACE_BILLING_ENABLED='false';assert.equal((await post(input)).status,503);
 }finally{if(previous===undefined)delete process.env.MARKETPLACE_BILLING_ENABLED;else process.env.MARKETPLACE_BILLING_ENABLED=previous;await db.close();}
});
test('Quotas reserve pending slots, reject overflow and expired publication, and expiry hides public listings without deleting them',async()=>{
 const db=new PGlite();const previous=process.env.MARKETPLACE_BILLING_ENABLED;
 try{
  await db.exec(fs.readFileSync('scripts/marketplace.sql','utf8'));await db.exec(fs.readFileSync('scripts/merchant-billing.sql','utf8'));
  const shop=crypto.randomUUID();await db.query("insert into marketplace_shops(id,owner_id,profile,status) values($1,'owner','{\"name\":\"Shop\"}','approved')",[shop]);
  await db.query("update marketplace_memberships set state='active',plan_id='starter',product_limit=10,valid_until=now()+interval '1 month' where shop_id=$1",[shop]);
  const save=async(id,status='pending',isNew=true)=>(await db.query("select marketplace_billable_listing($1,$2,'{}',$3,$4) as result",[id,shop,status,isNew])).rows[0].result;
  const ids=Array.from({length:11},()=>crypto.randomUUID());
  const routeAdapter={query:async(sql,p=[])=>(await db.query(sql,p)).rows,queryOne:async(sql,p=[])=>(await db.query(sql,p)).rows[0]??null};
  const route=loader({'@/lib/db':routeAdapter,'@/lib/auth':{getSession:async()=>({uid:'owner',isAdmin:false})}})('src/app/api/marketplace/route.ts');
  process.env.MARKETPLACE_BILLING_ENABLED='true';
  const inserted=[];
  await Promise.all(Array.from({length:11},async()=>{
   const response=await route.POST(new NextRequest('https://test.shop/api/marketplace',{method:'POST',headers:{origin:'https://test.shop','Content-Type':'application/json'},body:JSON.stringify({action:'listing',details:{title:'Produit de test',description:'Description de test complète',price:1000,category:'Mode',image:'',availability:'available'}})}));
   inserted.push(response.status===200?'ok':'quota');
  }));
  const saved=(await db.query('select id from marketplace_listings order by created_at')).rows;
  for(let i=0;i<10;i++) ids[i]=saved[i].id;
  const results=inserted;
  assert.equal(results.filter(r=>r==='ok').length,10);assert.equal(results.filter(r=>r==='quota').length,1);
  assert.equal(await save(ids[0],'approved',false),'ok');
  assert.equal(await save(ids[1],'suspended',false),'ok');assert.equal(await save(ids[10]),'ok');assert.equal(await save(ids[1],'approved',false),'quota');
  const adapter={query:async(sql,p=[])=>(await db.query(sql,p)).rows};const catalog=loader({'@/lib/db':adapter})('src/lib/marketplace-server.ts');
  process.env.MARKETPLACE_BILLING_ENABLED='true';assert.equal((await catalog.publicMarketplace()).listings.length,1);
  await db.query("update marketplace_memberships set valid_until=now()-interval '1 second' where shop_id=$1",[shop]);
  assert.equal(await save(ids[2],'approved',false),'expired');assert.equal((await catalog.publicMarketplace()).shops.length,0);assert.equal((await db.query('select count(*)::int as n from marketplace_listings')).rows[0].n,11);
  process.env.MARKETPLACE_BILLING_ENABLED='false';assert.equal((await catalog.publicMarketplace()).shops.length,1);
 }finally{if(previous===undefined)delete process.env.MARKETPLACE_BILLING_ENABLED;else process.env.MARKETPLACE_BILLING_ENABLED=previous;await db.close();}
});
