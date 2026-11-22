const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { PGlite } = require('@electric-sql/pglite');
const { NextRequest } = require('next/server');
const { createHash, randomBytes } = require('node:crypto');
function load(file, deps) {
  const m = { exports: {} };
  new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(name => deps[name] || require(name),m,m.exports);
  return m.exports;
}
async function fixture() {
  const db = new PGlite();
  for (const file of ['marketplace.sql','merchant-phone-auth.sql','merchant-access.sql']) await db.exec(fs.readFileSync('scripts/'+file,'utf8'));
  const shop = crypto.randomUUID(), other = crypto.randomUUID();
  await db.query("insert into marketplace_shops(id,owner_id,profile,status) values($1,'manual-marji',$3,'approved'),($2,'other-owner',$4,'approved')",[shop,other,JSON.stringify({name:'MARJI',whatsapp:'221775831637'}),JSON.stringify({name:'OTHER',whatsapp:'221771234567'})]);
  await db.query("insert into marketplace_listings(id,shop_id,details,status) values($1,$2,'{\"title\":\"Original\",\"price\":3000}','approved')",[crypto.randomUUID(),shop]);
  const one = async (sql,params=[]) => (await db.query(sql,params)).rows[0];
  const issue = async () => {
    const token = randomBytes(32).toString('hex'), digest = createHash('sha256').update(token).digest('hex');
    const row = await one('select issue_merchant_access_link($1,$2,$3) as phone',[shop,digest,'admin']);
    return {token,digest,phone:row.phone};
  };
  const consume = async digest => (await one('select consume_merchant_access_link($1,$2) as ok',[digest,'server-generated-password-hash'])).ok;
  return {db,shop,other,one,issue,consume};
}

test('Issuance is read-only for accounts/products; redemption grants only the named shop once', async () => {
  const f = await fixture(); try {
    const products = (await f.db.query('select * from marketplace_listings')).rows;
    const otherShop = await f.one('select * from marketplace_shops where id=$1',[f.other]);
    const link = await f.issue();
    assert.equal(link.phone,'+221775831637');
    assert.equal((await f.one('select count(*)::int n from merchant_phone_accounts')).n,0);
    assert.equal((await f.one('select owner_id from marketplace_shops where id=$1',[f.shop])).owner_id,'manual-marji');
    assert.equal(await f.consume(link.digest),true);
    assert.equal(await f.consume(link.digest),false);
    const account = await f.one('select * from merchant_phone_accounts');
    assert.equal(account.phone,'+221775831637');
    assert.equal((await f.one('select owner_id from marketplace_shops where id=$1',[f.shop])).owner_id,account.id);
    assert.deepEqual((await f.db.query('select * from marketplace_listings')).rows,products);
    assert.deepEqual(await f.one('select * from marketplace_shops where id=$1',[f.other]),otherShop);
    await f.db.exec(fs.readFileSync('scripts/merchant-access.sql','utf8'));
    assert.equal((await f.one('select password_hash from merchant_phone_accounts')).password_hash,'server-generated-password-hash');
  } finally { await f.db.close(); }
});

test('Expired, revoked and changed-shop links cannot change access', async () => {
  const f=await fixture();try {
    const old=await f.issue(), current=await f.issue();
    assert.equal(await f.consume(old.digest),false);
    await f.db.query("update merchant_access_links set expires_at=now()-interval '1 minute' where token_hash=$1",[current.digest]);
    assert.equal(await f.consume(current.digest),false);
    for(const change of ["owner_id='different-owner'","profile=jsonb_set(profile,'{whatsapp}','\"221771111111\"')","status='suspended'"]) {
      await f.db.query("update marketplace_shops set owner_id='manual-marji',profile='{\"name\":\"MARJI\",\"whatsapp\":\"221775831637\"}',status='approved' where id=$1",[f.shop]);
      const link=await f.issue();
      await f.db.query('update marketplace_shops set '+change+' where id=$1',[f.shop]);
      assert.equal(await f.consume(link.digest),false);
    }
    assert.equal((await f.one('select count(*)::int n from merchant_phone_accounts')).n,0);
  }finally{await f.db.close();}
});

test('Recovery revokes only this phone account sessions; conflicting shops remain protected', async () => {
  const f=await fixture();try {
    await f.db.query("insert into merchant_phone_accounts(id,phone,name,password_hash) values('marji-phone','+221775831637','MARJI','old'),('other-phone','+221771234567','OTHER','unchanged')");
    await f.db.query("insert into merchant_phone_sessions(token_hash,account_id,expires_at) values('session1','marji-phone',now()+interval '1 day'),('session2','other-phone',now()+interval '1 day')");
    await f.db.query("update marketplace_shops set owner_id='marji-phone' where id=$1",[f.other]);
    assert.equal((await f.issue()).phone,null);
    await f.db.query("update marketplace_shops set owner_id='other-phone' where id=$1",[f.other]);
    const link=await f.issue(); assert.equal(await f.consume(link.digest),true);
    assert.deepEqual((await f.db.query('select token_hash from merchant_phone_sessions')).rows,[{token_hash:'session2'}]);
    assert.equal((await f.one("select password_hash from merchant_phone_accounts where id='other-phone'")).password_hash,'unchanged');
  }finally{await f.db.close();}
});

test('Admin endpoint rejects cross-origin, anonymous and unverified requests before issuing a link', async () => {
  let admin=false, writes=0;
  const api=load('src/app/api/admin/merchant-access/route.ts',{
    '@/lib/auth':{getSession:async()=>admin?{uid:'admin',isAdmin:true}:null},
    '@/lib/db':{queryOne:async()=>{writes++;return {phone:'+221775831637'};}},
    '@/lib/merchant-phone-auth':{consumePhoneLimit:async()=>true},
  });
  const post=(body,origin='https://shop.test')=>api.POST(new NextRequest('https://shop.test/api/admin/merchant-access',{method:'POST',headers:{origin},body:JSON.stringify(body)}));
  const body={shopId:crypto.randomUUID(),verified:true};
  assert.equal((await post(body,'https://evil.test')).status,403);
  assert.equal((await post(body)).status,403);
  admin=true;assert.equal((await post({...body,verified:false})).status,400);assert.equal(writes,0);
  const response=await post(body);const data=await response.json();
  assert.match(data.url,/^https:\/\/shop.test\/acces-boutique#[a-f0-9]{64}$/);
  assert.equal(response.headers.get('cache-control'),'private, no-store');
});

test('Single-use redemption and SQL function permissions protect the recovery capability', async () => {
  const f=await fixture();try {
    const {migrationStatements}=await import('./sql-migration-statements.mjs');
    for(const sql of migrationStatements(fs.readFileSync('scripts/merchant-access.sql','utf8'))) await f.db.exec(sql);
    const link=await f.issue();
    const attempts=await Promise.all([f.consume(link.digest),f.consume(link.digest)]);
    assert.deepEqual(attempts,[true,false]);
    await f.db.exec('create role unprivileged_recovery; set role unprivileged_recovery');
    await assert.rejects(()=>f.db.query('select consume_merchant_access_link($1,$2)',[link.digest,'bad']),/permission denied/i);
    await f.db.exec('reset role');
  }finally{await f.db.close();}
});

test('Public endpoint validates origin/password and throttles before changing credentials', async () => {
  let allowed=true,writes=0;
  const api=load('src/app/api/merchant-access/route.ts',{
    '@/lib/db':{queryOne:async(_sql,params)=>{writes++;assert.notEqual(params[1],'valid-password-123');return {ok:true};}},
    '@/lib/merchant-phone-auth':{consumePhoneLimit:async()=>allowed},
  });
  const post=(body,origin='https://shop.test')=>api.POST(new NextRequest('https://shop.test/api/merchant-access',{method:'POST',headers:{origin},body:JSON.stringify(body)}));
  const body={token:'a'.repeat(64),password:'valid-password-123'};
  assert.equal((await post(body,'https://evil.test')).status,403);
  assert.equal((await post({...body,password:'short'})).status,400);
  assert.equal((await post({...body,password:'é'.repeat(40)})).status,400);
  allowed=false;assert.equal((await post(body)).status,429);assert.equal(writes,0);
  allowed=true;assert.equal((await post(body)).status,200);assert.equal(writes,1);
});
