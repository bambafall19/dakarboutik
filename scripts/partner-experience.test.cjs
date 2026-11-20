const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const {NextRequest,NextResponse}=require('next/server');
function load(file,deps={}) {const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(n=>n in deps?deps[n]:require(n),m,m.exports);return m.exports;}
const model=load('src/lib/marketplace-model.ts');
const options=load('src/lib/partner-options.ts',{'./marketplace-model':model});
const listing={id:'3a32229f-c6b2-4c8b-83b4-ad27640ab2f9',shop_id:'01b3c412-e007-4639-a764-aef0fd40152b',details:{title:'Extrait de parfum 30 ml — 32 senteurs au choix',price:3500}};
const shop={profile:{name:'MARJI',whatsapp:'221775831637'}};
test('All 32 scents preserve seller, exact price and chosen scent in WhatsApp',()=>{
 assert.equal(options.scentOptions(listing).length,32);
 for(const scent of options.MARJI_SCENTS){const url=new URL(options.selectedContactUrl(shop,listing,scent));assert.equal(url.pathname,'/221775831637');const message=url.searchParams.get('text');assert.ok(message.includes(listing.details.title));assert.match(message,/3\s500 FCFA/);assert.ok(message.endsWith('Senteur souhaitée : '+scent+'.'));assert.ok(!message.includes('�'));}
});
test('Scent selector is restricted to the exact MARJI listing; arbitrary values are ignored',()=>{
 assert.deepEqual(options.scentOptions({...listing,id:'another'}),[]);
 assert.deepEqual(options.scentOptions({...listing,shop_id:'another'}),[]);
 assert.equal(options.selectedContactUrl(shop,listing,'inventé'),model.contactUrl(shop,listing));
});
test('Favorite storage rejects malformed values, deduplicates and bounds size',()=>{
 for(const raw of [null,'bad','{}','null'])assert.deepEqual(options.parseFavoriteIds(raw),[]);
 assert.deepEqual(options.parseFavoriteIds('["a","a",null,3,"<script>","b"]'),['a','b']);
 assert.equal(options.parseFavoriteIds(JSON.stringify(Array.from({length:250},(_,i)=>'p-'+i))).length,200);
});
function route({session={uid:'owner'},body,shopRow={id:'owned-shop',name:'Owned'},origin=true}={}) {
 const writes=[];
 const mod=load('src/app/api/marketplace/visibility-request/route.ts',{
  '@/lib/auth':{getSession:async()=>session},
  '@/lib/public-form-guard':{readPublicForm:async()=>origin?{body}:{response:NextResponse.json({error:'Origine refusée.'},{status:403})}},
  '@/lib/db':{queryOne:async(sql,params)=>{writes.push({sql,params});return sql.startsWith('select')?shopRow:{id:'request'};}}
 });return {post:()=>mod.POST(new NextRequest('https://site.test/api/marketplace/visibility-request',{method:'POST'})),writes};
}
const valid={placement:'home',days:'7',email:'merchant@example.test',start:'2026-12-01',note:'Parfums'};
test('Advertising requires a signed-in owner and valid input, with no campaign activation',async()=>{
 for(const setup of [{session:null,body:valid},{origin:false,body:valid},{body:{...valid,days:'999'}},{body:{...valid,shopId:'other-shop'}},{body:{...valid,email:'bad'}},{body:{...valid,start:'2026-02-30'}}]){const r=route(setup);assert.ok((await r.post()).status>=400);assert.equal(r.writes.length,0);}
 const missing=route({body:valid,shopRow:null});assert.equal((await missing.post()).status,409);assert.equal(missing.writes.length,1);
 const good=route({body:valid});assert.equal((await good.post()).status,200);assert.equal(good.writes.length,2);assert.deepEqual(good.writes[0].params,['owner']);assert.match(good.writes[1].sql,/insert into contact_messages/);assert.equal(good.writes[1].params[1],'Owned');assert.match(good.writes[1].params[4],/owned-shop/);assert.match(good.writes[1].params[4],/Aucun paiement ni activation automatique/);
});
