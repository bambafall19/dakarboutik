const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const mod={exports:{}};
new Function('require','module','exports',ts.transpileModule(fs.readFileSync('src/lib/admin-partners.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(require,mod,mod.exports);
const {partnerOverview,isInternalOrder}=mod.exports;
const shops=[{id:'a',profile:{name:'Alpha'},status:'approved'},{id:'b',profile:{name:'Beta'},status:'suspended'},{id:'c',profile:{name:'Gamma'},status:'pending'}];
const listings=[{id:'1',shop_id:'a',status:'approved'},{id:'2',shop_id:'b',status:'approved'},{id:'3',shop_id:'a',status:'pending'}];
test('Visible counts follow the public catalogue, excluding suspended or unentitled shops',()=>{
 const s=partnerOverview(shops,listings,[shops[0]],[listings[0],listings[1]]);
 assert.equal(s.publishedShops,1);assert.equal(s.visibleProducts,1);assert.equal(s.suspendedShops,1);
 assert.equal(s.pendingShops.length,1);assert.equal(s.pendingProducts.length,1);
 assert.equal(s.shops.find(r=>r.shop.id==='b').visible,0);
 assert.equal(partnerOverview(shops,listings,[],[]).visibleProducts,0);
});
test('Shop ranking uses visible products and preserves source arrays',()=>{
 const s=partnerOverview([...shops].reverse(),listings,[shops[0]],[listings[0]]);
 assert.equal(s.shops[0].shop.id,'a');assert.equal(shops[0].id,'a');
 assert.equal(s.shops[0].total,2);
 assert.equal(partnerOverview([],[],[],[]).publishedShops,0);
});
test('Historical test orders are excluded by dedicated ID or explicit test name',()=>{
 assert.equal(isInternalOrder({orderId:'DKB-TEST-123',customerInfo:{name:'MMD'}}),true);
 assert.equal(isInternalOrder({orderId:'DKB-123',customerInfo:{name:' TEST INTERNE — Annulation avant paiement'}}),true);
 assert.equal(isInternalOrder({orderId:'DKB-123',customerInfo:{name:'Libasse'}}),false);
});
