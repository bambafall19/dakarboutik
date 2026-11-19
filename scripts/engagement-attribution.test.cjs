const fs=require('node:fs'),ts=require('typescript'),{test}=require('node:test'),assert=require('node:assert/strict');
const {PGlite}=require('@electric-sql/pglite'),{NextRequest}=require('next/server');
function load(file,deps={}){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText)(name=>deps[name]||require(name),m,m.exports);return m.exports;}
const attribution=load('src/lib/engagement-attribution.ts');
const model=load('src/lib/advertising.ts',{'./engagement-attribution':attribution});
const helpers=load('src/lib/partner-statistics.ts');
test('Attribution refuses shop IDs on support contacts and personal payloads',()=>{
 const base={id:crypto.randomUUID(),kind:'whatsapp_click',placement:'home'};
 assert.equal(model.eventSchema.safeParse({...base,audience:'partner',shopId:crypto.randomUUID()}).success,true);
 assert.equal(model.eventSchema.safeParse({...base,audience:'partner'}).success,false);
 assert.equal(model.eventSchema.safeParse({...base,audience:'support',shopId:crypto.randomUUID()}).success,false);
 assert.equal(model.eventSchema.safeParse({...base,audience:'legacy',message:'private message'}).success,false);
 assert.deepEqual(attribution.contactAttribution('partner','not-uuid'),{});
});
test('Postgres separates partner shops, support, legacy and unknown history without double counting',async()=>{
 const db=new PGlite();try{
  await db.exec(fs.readFileSync('scripts/advertising.sql','utf8'));await db.exec(fs.readFileSync('scripts/marketplace.sql','utf8'));
  await db.exec('create table orders(order_id text,customer_info jsonb,created_at timestamptz)');
  const deps={'@/lib/db':{query:async(s,p)=>(await db.query(s,p)).rows},'@/lib/auth':{getSession:async()=>({isAdmin:true})},'@/lib/advertising':model,'@/lib/partner-statistics':helpers,'@/lib/public-form-guard':{readPublicForm:async req=>({body:await req.json()})}};
  deps['@/lib/engagement-attribution-server']=load('src/lib/engagement-attribution-server.ts',deps);
  const setup=load('src/app/api/engagement/setup/route.ts',deps);
  const setupReq=origin=>new NextRequest('https://shop.test/api/engagement/setup',{method:'POST',headers:{origin}});
  assert.equal((await setup.POST(setupReq('https://foreign.test'))).status,403);
  assert.equal(await deps['@/lib/engagement-attribution-server'].attributionReady(),false);
  const a=crypto.randomUUID(),b=crypto.randomUUID(),suspended=crypto.randomUUID();
  for(const [id,name,status] of [[a,'Shop A','approved'],[b,'Shop B','approved'],[suspended,'Suspended','suspended']])await db.query('insert into marketplace_shops(id,owner_id,profile,status) values($1,$1,$2::jsonb,$3)',[id,JSON.stringify({name}),status]);
  const collector=load('src/app/api/engagement/route.ts',deps),stats=load('src/app/api/engagement/stats/route.ts',deps);
  const post=e=>collector.POST(new NextRequest('https://shop.test/api/engagement',{method:'POST',body:JSON.stringify({placement:'home',...e})}));
  const old=crypto.randomUUID();await post({id:old,kind:'whatsapp_click'});
  assert.equal((await setup.POST(setupReq('https://shop.test'))).status,200);
  assert.equal((await setup.POST(setupReq('https://shop.test'))).status,200);
  const event={id:crypto.randomUUID(),kind:'whatsapp_click',audience:'partner',shopId:a};
  assert.equal((await post(event)).status,204);await post(event); // retry must count once
  await post({id:crypto.randomUUID(),kind:'shop_view',audience:'partner',shopId:a});
  await post({id:crypto.randomUUID(),kind:'whatsapp_click',audience:'partner',shopId:b});
  await post({id:crypto.randomUUID(),kind:'whatsapp_click',audience:'support'});
  await post({id:crypto.randomUUID(),kind:'whatsapp_click',audience:'legacy'});
  await post({id:crypto.randomUUID(),kind:'whatsapp_click',audience:'partner',shopId:suspended});
  await post({id:old,kind:'whatsapp_click',audience:'partner',shopId:a}); // cannot relabel history
  const response=await stats.GET(new NextRequest('https://shop.test/api/engagement/stats?days=7'));
  assert.equal(response.status,200);const out=await response.json();
  assert.equal(out.attributionReady,true);assert.equal(out.partnerTotals.find(r=>r.kind==='whatsapp_click').total,2);
  assert.equal(out.shops.find(r=>r.id===a).clicks,1);assert.equal(out.shops.find(r=>r.id===a).views,1);assert.equal(out.shops.find(r=>r.id===suspended).clicks,0);
  for(const source of ['support','legacy','unattributed'])assert.equal(out.contactSources.find(r=>r.audience===source).clicks,1);
  assert.equal((await db.query('select count(*)::int as n from engagement_events')).rows[0].n,6);
  await db.query("update engagement_events set created_at=now()-interval '10 days' where id=$1",[event.id]);
  const recent=await(await stats.GET(new NextRequest('https://shop.test/api/engagement/stats?days=7'))).json();
  const month=await(await stats.GET(new NextRequest('https://shop.test/api/engagement/stats?days=30'))).json();
  assert.equal(recent.shops.find(r=>r.id===a).clicks,0);assert.equal(month.shops.find(r=>r.id===a).clicks,1);
 }finally{await db.close();}
});
