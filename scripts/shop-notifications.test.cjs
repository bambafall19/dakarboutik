const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');const {PGlite}=require('@electric-sql/pglite');const {NextRequest}=require('next/server');
function load(file,deps={}){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(n=>n in deps?deps[n]:require(n),m,m.exports);return m.exports;}
test('A new shop queues one durable alert; edits and suspended resubmissions do not queue again; email failures do not lose the shop',async()=>{
 const db=new PGlite();const tasks=[];let session={uid:'owner',isAdmin:false};const oldEnv={to:process.env.SHOP_ALERT_EMAIL_TO,from:process.env.ORDER_EMAIL_FROM,key:process.env.RESEND_API_KEY};const oldFetch=global.fetch;
 try {
  await db.exec(fs.readFileSync('scripts/marketplace.sql','utf8'));const migration=fs.readFileSync('scripts/shop-notifications.sql','utf8');await db.exec(migration);await db.exec(migration);
  const adapter={query:async(s,p=[])=>(await db.query(s,p)).rows,queryOne:async(s,p=[])=>(await db.query(s,p)).rows[0]??null};
  const mail=load('src/lib/shop-notifications.ts',{'server-only':{},'@/lib/db':adapter});
  const deps={'next/server':{...require('next/server'),after:f=>tasks.push(f)},'@/lib/db':adapter,'@/lib/auth':{getSession:async()=>session},'@/lib/shop-notifications':mail,'@/lib/marketplace-model':load('src/lib/marketplace-model.ts'),'@/lib/merchant-plans':{billingEnabled:()=>false},'@/lib/merchant-billing-server':{}};
  const route=load('src/app/api/marketplace/route.ts',deps);const alerts=load('src/app/api/marketplace/notifications/route.ts',deps);
  const request=(body,origin='https://site.test')=>new NextRequest('https://site.test/api/marketplace',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
  const profile={name:'Nouvelle boutique',description:'Description boutique',category:'Parfumerie',city:'Mbao',district:'',address:'Villa 215',hours:'',whatsapp:'221775831637',image:''};
  assert.equal((await route.POST(request({action:'shop',profile}))).status,200);assert.equal(tasks.length,1);
  const shop=(await db.query('select * from marketplace_shops')).rows[0];assert.equal(shop.status,'pending');
  await route.POST(request({action:'shop',profile:{...profile,name:'Nom modifié'}}));assert.equal(tasks.length,1);assert.equal((await db.query('select * from marketplace_shop_alerts')).rows.length,1);
  await db.query("update marketplace_shops set status='suspended' where id=$1",[shop.id]);await route.POST(request({action:'shop',profile}));assert.equal(tasks.length,1);assert.equal((await db.query('select status from marketplace_shops')).rows[0].status,'suspended');
  delete process.env.SHOP_ALERT_EMAIL_TO;delete process.env.RESEND_API_KEY;await tasks[0]();assert.equal((await db.query('select email_status from marketplace_shop_alerts')).rows[0].email_status,'unconfigured');
  process.env.SHOP_ALERT_EMAIL_TO='owner@example.test';process.env.ORDER_EMAIL_FROM='DakarBoutik <alerts@example.test>';process.env.RESEND_API_KEY='test-key';
  let calls=0,payload;global.fetch=async(url,init)=>{calls++;payload={url,...init};return {ok:false};};
  await db.exec("update marketplace_shop_alerts set last_attempt_at=now()-interval '2 minutes'");await mail.sendShopAlert(shop.id);assert.equal(calls,1);assert.equal((await db.query('select email_status from marketplace_shop_alerts')).rows[0].email_status,'failed');
  global.fetch=async(url,init)=>{calls++;payload={url,...init};return {ok:true};};await db.exec("update marketplace_shop_alerts set last_attempt_at=now()-interval '2 minutes'");
  await Promise.all([mail.sendShopAlert(shop.id),mail.sendShopAlert(shop.id)]);assert.equal(calls,2);assert.equal((await db.query('select email_status from marketplace_shop_alerts')).rows[0].email_status,'sent');
  assert.equal(payload.headers['Idempotency-Key'],'new-partner-shop/'+shop.id);const body=JSON.parse(payload.body);assert.deepEqual(body.to,['owner@example.test']);assert.match(body.text,/https:\/\/dakarboutik.net\/admin\/boutiques#boutiques/);assert.ok(!body.text.includes('221775831637'));
  await mail.sendShopAlert(shop.id);assert.equal(calls,2);
  assert.equal((await alerts.GET()).status,403);session={uid:'admin',isAdmin:true};const response=await alerts.GET();assert.equal(response.headers.get('cache-control'),'no-store');assert.equal((await response.json()).pendingCount,0);
  assert.equal((await alerts.POST(request({id:shop.id},'https://evil.test'))).status,403);assert.equal((await alerts.POST(request({id:shop.id}))).status,409);
  await db.query("update marketplace_shops set status='pending' where id=$1",[shop.id]);const data=await (await alerts.GET()).json();assert.equal(data.pendingCount,1);assert.equal(data.notifications[0].id,shop.id);assert.equal(data.notifications[0].email_status,'sent');
 } finally {global.fetch=oldFetch;for(const [key,value] of [['SHOP_ALERT_EMAIL_TO',oldEnv.to],['ORDER_EMAIL_FROM',oldEnv.from],['RESEND_API_KEY',oldEnv.key]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}await db.close();}
});

test('Moderation alerts persist across reads and count pending products independently from pending shops',async()=>{
 const db=new PGlite();let session=null;
 try{
  for(const file of ['marketplace.sql','shop-notifications.sql'])await db.exec(fs.readFileSync('scripts/'+file,'utf8'));
  const shop=crypto.randomUUID(),pendingShop=crypto.randomUUID(),product=crypto.randomUUID(),other=crypto.randomUUID();
  await db.query("insert into marketplace_shops(id,owner_id,profile,status) values($1,'owner','{\"name\":\"Published shop\"}','approved'),($2,'new-owner','{\"name\":\"New shop\"}','pending')",[shop,pendingShop]);
  await db.query("insert into marketplace_listings(id,shop_id,details,status) values($1,$2,'{\"title\":\"New product\"}','pending'),($3,$2,'{\"title\":\"Visible product\"}','approved')",[product,shop,other]);
  const adapter={query:async(s,p=[])=>(await db.query(s,p)).rows,queryOne:async(s,p=[])=>(await db.query(s,p)).rows[0]??null};
  const api=load('src/app/api/marketplace/notifications/route.ts',{'@/lib/db':adapter,'@/lib/auth':{getSession:async()=>session},'@/lib/shop-notifications':{shopEmailConfig:()=>null}});
  assert.equal((await api.GET()).status,403);session={isAdmin:false};assert.equal((await api.GET()).status,403);session={isAdmin:true};
  const read=async()=>{const r=await api.GET();assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');return r.json();};
  for(let n=0;n<2;n++){const d=await read();assert.equal(d.pendingCount,1);assert.equal(d.pendingProductsCount,1);assert.equal(d.products[0].id,product);assert.equal(d.products[0].shop_name,'Published shop');}
  await db.query("update marketplace_shops set status='approved' where id=$1",[pendingShop]);let d=await read();assert.equal(d.pendingCount,0);assert.equal(d.pendingProductsCount,1);
  await db.query("update marketplace_listings set status='approved' where id=$1",[product]);d=await read();assert.equal(d.pendingProductsCount,0);assert.deepEqual(d.products,[]);
  await db.query("update marketplace_listings set status='pending' where id=$1",[product]);assert.equal((await read()).pendingProductsCount,1);
  await db.query("update marketplace_listings set status='suspended' where id=$1",[product]);assert.equal((await read()).pendingProductsCount,0);
 }finally{await db.close();}
});
