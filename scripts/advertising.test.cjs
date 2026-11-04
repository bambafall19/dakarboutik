const fs=require('node:fs');
const ts=require('typescript');
const test=require('node:test');
const assert=require('node:assert/strict');
const {PGlite}=require('@electric-sql/pglite');
const {NextRequest}=require('next/server');
function load(file,deps={}) {const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText)(name=>deps[name]||require(name),m,m.exports);return m.exports;}
const model=load('src/lib/advertising.ts');
const base={title:'Batterie solaire',imageUrl:'/api/media/file/photo',targetUrl:'/products/batterie',placement:'home',active:true,startsOn:'2026-11-04',endsOn:'2026-11-05'};
test('Campaigns reject unsafe URLs and impossible or reversed dates',()=>{
 for(const url of ['javascript:alert(1)','//evil.test','/\\evil.test','http://evil.test','data:image/svg+xml,test','https://user:password@example.com']) assert.equal(model.campaignSchema.safeParse({...base,targetUrl:url}).success,false,url);
 for(const startsOn of ['2026-02-30','2026-99-99','garbage'])assert.equal(model.campaignSchema.safeParse({...base,startsOn}).success,false);
 assert.equal(model.campaignSchema.safeParse({...base,endsOn:'2026-11-03'}).success,false);
 assert.equal(model.campaignSchema.safeParse(base).success,true);
});
test('Inactive, future and expired campaigns do not display; end date is inclusive',()=>{
 assert.equal(model.campaignLive(base,'2026-11-04'),true);assert.equal(model.campaignLive(base,'2026-11-05'),true);
 assert.equal(model.campaignLive(base,'2026-11-03'),false);assert.equal(model.campaignLive(base,'2026-11-06'),false);
 assert.equal(model.campaignLive({...base,active:false},'2026-11-04'),false);
});
test('Events exclude personal payloads and require a campaign only for advertising',()=>{
 const e={id:crypto.randomUUID(),kind:'whatsapp_click',placement:'home'};
 assert.equal(model.eventSchema.safeParse(e).success,true);
 assert.equal(model.eventSchema.safeParse({...e,phone:'771234567'}).success,false);
 assert.equal(model.eventSchema.safeParse({...e,kind:'ad_click'}).success,false);
 assert.equal(model.eventSchema.safeParse({...e,campaignId:crypto.randomUUID()}).success,false);
});
test('Campaign API protects administration and preserves data when deactivated',async()=>{
 const db=new PGlite();await db.exec(fs.readFileSync('scripts/advertising.sql','utf8'));
 let admin=false;
 const deps={'@/lib/db':{query:async(sql,p)=>(await db.query(sql,p)).rows},'@/lib/auth':{getSession:async()=>({isAdmin:admin})},'@/lib/advertising':model,'@/lib/public-form-guard':{readPublicForm:async req=>({body:await req.json()})}};
 const api=load('src/app/api/advertising/route.ts',deps);
 const req=(data,origin='https://shop.test')=>new NextRequest('https://shop.test/api/advertising',{method:'POST',headers:{origin},body:JSON.stringify(data)});
 assert.equal((await api.GET(new NextRequest('https://shop.test/api/advertising?admin=1'))).status,403);
 assert.equal((await api.POST(req(base))).status,403);admin=true;
 assert.equal((await api.POST(req(base,'https://foreign.test'))).status,403);
 const saved=await(await api.POST(req({...base,startsOn:'',endsOn:''}))).json();
 assert.equal((await(await api.GET(new NextRequest('https://shop.test/api/advertising'))).json()).length,1);
 await api.POST(req({...saved,active:false}));
 assert.equal((await(await api.GET(new NextRequest('https://shop.test/api/advertising'))).json()).length,0);
 const adminRows=await(await api.GET(new NextRequest('https://shop.test/api/advertising?admin=1'))).json();assert.equal(adminRows[0].title,base.title);
 await db.close();
});
test('SQL counts a unique event once, rejects inactive or wrong-slot campaigns, and reports exact totals',async()=>{
 const db=new PGlite();await db.exec(fs.readFileSync('scripts/advertising.sql','utf8'));
 const cid=crypto.randomUUID();
 await db.query("insert into advertising_campaigns(id,title,image_url,target_url,placement,active) values($1,'Test','/photo','/products','home',true)",[cid]);
 const deps={'@/lib/db':{query:async(sql,p)=>(await db.query(sql,p)).rows},'@/lib/advertising':model,'@/lib/public-form-guard':{readPublicForm:async req=>({body:await req.json()})}};
 const route=load('src/app/api/engagement/route.ts',deps);
 const event={id:crypto.randomUUID(),kind:'ad_view',placement:'home',campaignId:cid};
 const post=e=>route.POST(new NextRequest('https://shop.test/api/engagement',{method:'POST',body:JSON.stringify(e)}));
 await post(event);await post(event);await post({...event,id:crypto.randomUUID(),placement:'shops'});
 await post({...event,id:crypto.randomUUID(),campaignId:crypto.randomUUID()});
 const stats=load('src/app/api/engagement/stats/route.ts',{'@/lib/db':deps['@/lib/db'],'@/lib/auth':{getSession:async()=>({isAdmin:true})}});
 const summary=await(await stats.GET(new NextRequest('https://shop.test/api/engagement/stats?days=30'))).json();
 assert.equal(summary.campaigns[0].views,1);assert.equal(summary.totals[0].total,1);
 await db.query('update advertising_campaigns set active=false where id=$1',[cid]);await post({...event,id:crypto.randomUUID()});
 assert.equal((await db.query('select count(*)::int as n from engagement_events')).rows[0].n,1);
 const denied=load('src/app/api/engagement/stats/route.ts',{'@/lib/auth':{getSession:async()=>null},'@/lib/db':deps['@/lib/db']});
 assert.equal((await denied.GET(new NextRequest('https://shop.test/api/engagement/stats'))).status,403);
 await db.close();
});
