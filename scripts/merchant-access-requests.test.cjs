const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');const {PGlite}=require('@electric-sql/pglite');const {NextRequest}=require('next/server');
function load(file,deps={}){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(n=>n in deps?deps[n]:require(n),m,m.exports);return m.exports;}
const request=(body,origin='https://site.test')=>new NextRequest('https://site.test/api/merchant-access-requests',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
async function fixture(){const db=new PGlite();for(const f of ['marketplace.sql','merchant-phone-auth.sql','merchant-access.sql','merchant-access-requests.sql'])await db.exec(fs.readFileSync('scripts/'+f,'utf8'));await db.exec(fs.readFileSync('scripts/merchant-access-requests.sql','utf8'));return {db,adapter:{query:async(s,p=[])=>(await db.query(s,p)).rows,queryOne:async(s,p=[])=>(await db.query(s,p)).rows[0]??null}};}
test('Public requests are durable and deduplicated, do not reveal accounts or alter access, products or shops',async()=>{
 const {db,adapter}=await fixture();const tasks=[];let allowed=true;try{
  await db.query("insert into marketplace_shops(id,owner_id,profile,status) values($1,'owner','{\"name\":\"MARJI\",\"whatsapp\":\"221775831637\"}','approved')",[crypto.randomUUID()]);
  const before=(await db.query('select * from marketplace_shops')).rows;
  const phone=load('src/lib/merchant-phone-auth.ts',{'server-only':{},'@/lib/db':adapter});
  const api=load('src/app/api/merchant-access-requests/route.ts',{'next/server':{...require('next/server'),after:f=>tasks.push(f)},'@/lib/db':adapter,'@/lib/merchant-phone-auth':{normalizePhone:phone.normalizePhone,consumePhoneLimit:async()=>allowed},'@/lib/merchant-recovery-alert':{sendRecoveryAlert:async()=>{}}});
  const body={shopName:'MARJI',phone:'77 583 16 37',reason:'forgot'};
  assert.equal((await api.POST(request(body,'https://evil.test'))).status,403);
  assert.equal((await api.POST(request({...body,phone:'invalid'}))).status,400);
  assert.equal((await api.POST(request({...body,password:'must-not-be-accepted'}))).status,400);
  assert.equal((await api.POST(request(body))).status,200);assert.equal(tasks.length,1);
  assert.equal((await api.POST(request({...body,reason:'first-access'}))).status,200);assert.equal(tasks.length,1);
  const rows=(await db.query('select * from merchant_access_requests')).rows;assert.equal(rows.length,1);assert.equal(rows[0].phone,'+221775831637');
  assert.deepEqual(await (await api.POST(request({...body,phone:'771234567'}))).json(),{ok:true});
  allowed=false;assert.equal((await api.POST(request(body))).status,429);
  assert.deepEqual((await db.query('select * from marketplace_shops')).rows,before);
  assert.equal((await db.query('select * from merchant_phone_accounts')).rows.length,0);assert.equal((await db.query('select * from merchant_access_links')).rows.length,0);
 }finally{await db.close();}
});
test('Admin requests are private, phone matching ignores the claimed shop name, resolving preserves history and allows a future request',async()=>{
 const {db,adapter}=await fixture();let session=null;try{
  const shop=crypto.randomUUID();await db.query("insert into marketplace_shops(id,owner_id,profile,status) values($1,'owner','{\"name\":\"Registered shop\",\"whatsapp\":\"221775831637\"}','approved')",[shop]);
  const {rows:[r]}=await db.query("insert into merchant_access_requests(phone,shop_name,reason) values('+221775831637','Unverified name','forgot') returning id");
  const api=load('src/app/api/admin/merchant-access-requests/route.ts',{'@/lib/auth':{getSession:async()=>session},'@/lib/db':adapter,'@/lib/shop-notifications':{shopEmailConfig:()=>null},'@/lib/merchant-recovery-alert':{sendRecoveryAlert:async()=>{}}});
  assert.equal((await api.GET()).status,403);session={uid:'owner',isAdmin:false};assert.equal((await api.GET()).status,403);
  session={uid:'admin',isAdmin:true};const res=await api.GET();assert.equal(res.headers.get('cache-control'),'private, no-store');const data=await res.json();assert.equal(data.pendingCount,1);assert.equal(data.requests[0].shop_id,shop);assert.equal(data.requests[0].registered_name,'Registered shop');
  assert.equal((await api.POST(request({id:r.id,action:'resolve'},'https://evil.test'))).status,403);
  assert.equal((await api.POST(request({id:r.id,action:'retry'}))).status,409);
  assert.equal((await api.POST(request({id:r.id,action:'resolve'}))).status,200);
  assert.equal((await (await api.GET()).json()).pendingCount,0);assert.equal((await db.query('select * from merchant_access_requests')).rows.length,1);
  assert.equal((await db.query('select resolved_by from merchant_access_requests')).rows[0].resolved_by,'admin');
  await db.query("insert into merchant_access_requests(phone,shop_name,reason) values('+221775831637','Again','forgot')");
  assert.equal((await (await api.GET()).json()).pendingCount,1);
 }finally{await db.close();}
});
test('Recovery alerts record missing config and failures; retries send only once to configured admin, never an access token',async()=>{
 const {db,adapter}=await fixture();let configured=false,calls=0,payload;const oldFetch=global.fetch;
 try{
  const {rows:[r]}=await db.query("insert into merchant_access_requests(phone,shop_name,reason) values('+221775831637','MARJI','forgot') returning id");
  const mail=load('src/lib/merchant-recovery-alert.ts',{'server-only':{},'@/lib/db':adapter,'@/lib/shop-notifications':{shopEmailConfig:()=>configured?{from:'alerts@example.test',to:'admin@example.test',key:'test-key'}:null}});
  const status=async()=>(await db.query('select email_status from merchant_access_requests where id=$1',[r.id])).rows[0].email_status;
  await mail.sendRecoveryAlert(r.id);assert.equal(await status(),'unconfigured');
  configured=true;global.fetch=async()=>{calls++;return {ok:false};};await db.exec("update merchant_access_requests set last_attempt_at=now()-interval '2 minutes'");await mail.sendRecoveryAlert(r.id);assert.equal(await status(),'failed');
  await db.exec("update merchant_access_requests set last_attempt_at=now()-interval '2 minutes'");global.fetch=async(url,init)=>{calls++;payload={url,...init};return {ok:true};};
  await Promise.all([mail.sendRecoveryAlert(r.id),mail.sendRecoveryAlert(r.id)]);assert.equal(await status(),'sent');assert.equal(calls,2);
  const body=JSON.parse(payload.body);assert.deepEqual(body.to,['admin@example.test']);assert.match(body.text,/ne prouve pas son identité/);assert.match(body.text,/admin\/boutiques#demandes-acces/);assert.ok(!body.text.includes('/acces-boutique#'));assert.equal(payload.headers['Idempotency-Key'],'merchant-recovery/'+r.id);
  await mail.sendRecoveryAlert(r.id);assert.equal(calls,2);
 }finally{global.fetch=oldFetch;await db.close();}
});
