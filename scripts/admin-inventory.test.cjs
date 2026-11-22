const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
function load(name){const mod={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync('src/lib/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(id=>id.startsWith('./')?load(id.slice(2)):require(id),mod,mod.exports);return mod.exports;}
const {filterAdminInventory:filter,adminInventoryCategories:categories}=load('admin-inventory');
const shops=[{id:'a',profile:{name:'MARJI'}},{id:'b',profile:{name:'CBS'}}];
const listings=[{id:'1',shop_id:'a',status:'approved',details:{title:'Brume parfumée',description:'Fruits rouges',category:'Parfumerie'}},{id:'2',shop_id:'a',status:'suspended',details:{title:'Ancienne senteur',description:'Archive',category:'Parfumerie'}},{id:'3',shop_id:'b',status:'pending',details:{title:'Ordinateur',description:'Portable',category:'Informatique'}}];
test('Archives are separate and preserve all original records',()=>{const before=JSON.stringify(listings);assert.deepEqual(filter(listings,shops,{}).map(x=>x.id),['1','3']);assert.deepEqual(filter(listings,shops,{archive:true}).map(x=>x.id),['2']);assert.equal(JSON.stringify(listings),before);});
test('Search matches accents, shop names and every search word',()=>{assert.equal(filter(listings,shops,{search:'MARJI parfumee'}).length,1);assert.equal(filter(listings,shops,{search:'MARJI ordinateur'}).length,0);});
test('Shop category and status combine; removing one preserves the others',()=>{assert.equal(filter(listings,shops,{shopId:'b',category:'Informatique',status:'pending'}).length,1);assert.equal(filter(listings,shops,{shopId:'b',category:'Informatique',status:'approved'}).length,0);assert.equal(filter(listings,shops,{shopId:'b',category:'Informatique'}).length,1);assert.equal(filter([],shops,{}).length,0);});

test('Legacy category aliases collapse and match without changing source records',()=>{
 const records=['Parfum','Parfumerie','SOLAIRE','Solaire','mode','Beauté'].map((category,index)=>({...listings[0],id:String(index),details:{...listings[0].details,category}}));
 const before=JSON.stringify(records);
 assert.deepEqual(categories(records),['Mode & Beauté','Parfumerie','Solaire']);
 assert.equal(filter(records,shops,{category:'Parfumerie'}).length,2);
 assert.equal(filter(records,shops,{category:'Solaire'}).length,2);
 assert.equal(JSON.stringify(records),before);
});
test('Availability combines with shop, category, search, status and archives',()=>{
 const records=[{...listings[0],details:{...listings[0].details,availability:'available'}},{...listings[0],id:'order',details:{...listings[0].details,availability:'order'}},{...listings[1],details:{...listings[1].details,availability:'sold_out'}}];
 const active={shopId:'a',category:'Parfum',search:'parfumee',status:'approved'};
 assert.deepEqual(filter(records,shops,{...active,availability:'order'}).map(x=>x.id),['order']);
 assert.equal(filter(records,shops,{...active,availability:'sold_out'}).length,0);
 assert.equal(filter(records,shops,active).length,2);
 assert.deepEqual(filter(records,shops,{archive:true,availability:'sold_out'}).map(x=>x.id),['2']);
});
