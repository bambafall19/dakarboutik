const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const { NextRequest } = require("next/server");

function load(file, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(
    (name) => (name in dependencies ? dependencies[name] : require(name)),
    module,
    module.exports,
  );
  return module.exports;
}

test("Direct-store purchases are rejected before validation or database writes", async () => {
  const fail = () => {
    throw Error("Must not reach the database or public form");
  };
  const api = load("src/app/api/orders/route.ts", {
    "@/lib/catalog-mode": { OFFICIAL_CATALOG_ENABLED: false },
    "@/lib/db": { query: fail, queryOne: fail },
    "@/lib/auth": {},
    "@/lib/order-channels": {},
    "@/lib/site-settings-server": {},
    "@/lib/order-totals": {},
    "@/lib/public-form-guard": { readPublicForm: fail },
  });
  const response = await api.POST(
    new NextRequest("https://shop.test/api/orders", {
      method: "POST",
      body: "{}",
    }),
  );
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /boutique partenaire/);
});

test("Visitors cannot retrieve the official catalogue while administrators retain it", async () => {
  let admin = false;
  let reads = 0;
  const api = load("src/app/api/products/route.ts", {
    "@/lib/catalog-mode": { OFFICIAL_CATALOG_ENABLED: false },
    "@/lib/auth": {
      getSession: async () => (admin ? { isAdmin: true } : null),
    },
    "@/lib/db": {
      query: async () => {
        reads++;
        return [{ id: "legacy-product", price: 100, stock: 5 }];
      },
    },
  });
  assert.deepEqual(
    await (
      await api.GET(new NextRequest("https://shop.test/api/products"))
    ).json(),
    [],
  );
  assert.equal(
    await (
      await api.GET(new NextRequest("https://shop.test/api/products?slug=old"))
    ).json(),
    null,
  );
  assert.equal(reads, 0);
  admin = true;
  assert.equal(
    (
      await (
        await api.GET(new NextRequest("https://shop.test/api/products"))
      ).json()
    )[0].id,
    "legacy-product",
  );
  assert.equal(reads, 1);
});

test("Server product pages receive no official product when direct sales are closed", async () => {
  const data = load("src/lib/data-firebase.ts", {
    "server-only": {},
    "./catalog-mode": { OFFICIAL_CATALOG_ENABLED: false },
    "./db": {
      query: () => {
        throw Error("Unexpected catalogue read");
      },
    },
    "./data": {},
  });
  assert.deepEqual(await data.getProducts(), []);
  assert.equal(await data.getProductBySlug("old-product"), null);
});

test("Partner discovery matches accents and reordered words, and ranks only published products", () => {
  const model = load("src/lib/marketplace-model.ts");
  const discovery = load("src/lib/marketplace-discovery.ts", {
    "./marketplace-model": model,
  });
  const shop = {
    id: "s1",
    status: "approved",
    profile: { name: "CBS", city: "Dakar", district: "Médina" },
  };
  const item = {
    id: "l1",
    shop_id: "s1",
    status: "approved",
    details: {
      title: "Ordinateur portable Dell",
      description: "SSD",
      category: "Informatique",
    },
  };
  assert.equal(
    discovery.matchesPartnerSearch(item, shop, "DAKAR dell portable"),
    true,
  );
  assert.equal(discovery.matchesPartnerSearch(item, shop, "medina"), true);
  assert.equal(discovery.matchesPartnerSearch(item, shop, "iphone"), false);
  assert.equal(discovery.partnerCategoryMatches(item, "Informatique"), true);
  const second = {
    ...shop,
    id: "s2",
    profile: { ...shop.profile, name: "MMD TECH" },
  };
  const ranked = discovery.rankActiveShops(
    [shop, second, { ...shop, id: "hidden", status: "suspended" }],
    [
      item,
      { ...item, id: "l2", shop_id: "s2" },
      { ...item, id: "l3", shop_id: "s2" },
      { ...item, id: "hidden-listing", status: "suspended" },
    ],
  );
  assert.deepEqual(
    ranked.map((row) => [row.shop.id, row.count]),
    [
      ["s2", 2],
      ["s1", 1],
    ],
  );
});

test('Catalogue categories merge case, accents and whitespace without changing custom categories', () => {
 const model=load('src/lib/marketplace-model.ts');
 const discovery=load('src/lib/marketplace-discovery.ts',{'./marketplace-model':model});
 const categories=discovery.catalogueCategories(['SOLAIRE',' solaire ','BEAUTE','Beauté','Parfum','parfum','']);
 assert.equal(categories.filter(x=>model.normalizeMarketplaceText(x)==='solaire').length,1);
 assert.equal(categories.filter(x=>model.normalizeMarketplaceText(x)==='mode & beaute').length,1);
 assert.equal(categories.filter(x=>model.normalizeMarketplaceText(x)==='parfumerie').length,1);
 assert.ok(categories.includes('Solaire'));
 assert.ok(categories.includes('Parfumerie'));
});

 test('Mode and beauty merge while legacy perfume listings appear in Parfumerie',()=>{
 const model=load('src/lib/marketplace-model.ts');
 const discovery=load('src/lib/marketplace-discovery.ts',{'./marketplace-model':model});
 for(const category of ['Mode','Beauté','MODE & BEAUTE'])assert.equal(discovery.canonicalCategory(category),'Mode & Beauté');
 for(const category of ['Parfum','PARFUMS','Parfumerie'])assert.equal(discovery.canonicalCategory(category),'Parfumerie');
 assert.equal(model.matchesMarketplaceCategory({title:'Robe coton',category:'Mode'},'Mode & Beauté'),true);
 assert.equal(model.matchesMarketplaceCategory({title:'Crème hydratante',category:'Beauté'},'Mode & Beauté'),true);
 assert.equal(model.matchesMarketplaceCategory({title:'Loris',category:'Parfum'},'Parfumerie'),true);
 assert.equal(model.matchesMarketplaceCategory({title:'Loris',category:'Parfum'},'Mode & Beauté'),false);
 assert.equal(model.matchesMarketplaceCategory({title:'Ordinateur',category:'Informatique'},'Parfumerie'),false);
 });
