const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { PGlite } = require("@electric-sql/pglite");
const { NextRequest } = require("next/server");

test("Public registration cannot bootstrap an administrator", async () => {
  const previous = process.env.ADMIN_BOOTSTRAP_EMAIL;
  delete process.env.ADMIN_BOOTSTRAP_EMAIL;
  try {
    const api = load("src/app/api/auth/become-admin/route.ts", {
      "@/lib/auth": { getSession: async () => ({ uid: "merchant", email: "merchant@example.test", isAdmin: false }) },
      "@/lib/db": { queryOne: async () => { throw new Error("Unauthorized request reached the database"); } },
    });
    assert.equal((await api.POST()).status, 403);
  } finally {
    if (previous === undefined) delete process.env.ADMIN_BOOTSTRAP_EMAIL;
    else process.env.ADMIN_BOOTSTRAP_EMAIL = previous;
  }
});

// Execute the real route and SQL with an isolated PostgreSQL engine; only auth is substituted.
function load(file, dependencies) {
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      target: ts.ScriptTarget.ES2022,
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

test("Merchant isolation, moderation, stock updates and public visibility", async () => {
  const db = new PGlite();
  try {
    const migration = fs.readFileSync(
      path.join(__dirname, "marketplace.sql"),
      "utf8",
    );
    await db.exec(migration);
    await db.exec(migration); // Reapplying the migration must preserve data/schema.
    let session = null;
    const adapter = {
      query: async (sql, values = []) => (await db.query(sql, values)).rows,
      queryOne: async (sql, values = []) =>
        (await db.query(sql, values)).rows[0] ?? null,
    };
    const model = load("src/lib/marketplace-model.ts", {});
    const dependencies = {
      "@/lib/db": adapter,
      "@/lib/auth": { getSession: async () => session },
      "@/lib/marketplace-model": model,
      "server-only": {},
    };
    const api = load("src/app/api/marketplace/route.ts", dependencies);
    const catalog = load("src/lib/marketplace-server.ts", dependencies);
    const post = (body) =>
      api.POST(
        new NextRequest("https://shop.test/api/marketplace", {
          method: "POST",
          headers: {
            origin: "https://shop.test",
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        }),
      );
    const get = (query) =>
      api.GET(
        new NextRequest(`https://shop.test/api/marketplace${query || ""}`),
      );
    const profile = {
      name: "Test Boutique",
      description: "Boutique de test",
      category: "Mode",
      city: "Dakar",
      district: "Centre",
      address: "Rue de test",
      hours: "9h–18h",
      whatsapp: "221771234567",
      image: "",
    };
    const details = {
      title: "Produit test",
      productUrl: "https://boutique.example/produits/onduleur",
      description: "Description de test",
      category: "Mode",
      price: 1000,
      image: "",
      availability: "available",
    };
    assert.equal((await post({ action: "shop", profile })).status, 401);
    session = { uid: "merchant-a", isAdmin: false };
    assert.equal(
      (
        await api.POST(
          new NextRequest("https://shop.test/api/marketplace", {
            method: "POST",
            headers: { origin: "https://attacker.test" },
          }),
        )
      ).status,
      403,
    );
    const shopA = await (
      await post({
        action: "shop",
        profile,
        owner_id: "merchant-b",
        status: "approved",
      })
    ).json();
    assert.equal((await catalog.publicMarketplace()).shops.length, 0);
    assert.equal((await get("?admin=1")).status, 403);
    assert.equal(
      (
        await post({
          action: "moderate",
          kind: "shop",
          id: shopA.id,
          status: "approved",
        })
      ).status,
      403,
    );
    assert.equal((await post({ action: "listing", details })).status, 200);
    const listingA = (await (await get()).json()).listings[0];
    assert.equal(listingA.details.productUrl, details.productUrl);
    assert.equal((await post({ action: "listing", id: listingA.id, details: { ...details, productUrl: "javascript:alert(1)" } })).status, 400);
    session = { uid: "merchant-b", isAdmin: false };
    await post({
      action: "shop",
      profile: { ...profile, name: "Second shop" },
    });
    assert.equal((await (await get()).json()).listings.length, 0);
    assert.equal(
      (await post({ action: "listing", id: listingA.id, details })).status,
      404,
    );
    assert.equal(
      (
        await post({
          action: "availability",
          id: listingA.id,
          availability: "sold_out",
        })
      ).status,
      404,
    );
    session = { uid: "admin", isAdmin: true };
    await post({
      action: "moderate",
      kind: "shop",
      id: shopA.id,
      status: "approved",
    });
    assert.equal((await catalog.publicMarketplace()).listings.length, 0);
    await post({
      action: "moderate",
      kind: "listing",
      id: listingA.id,
      status: "approved",
    });
    assert.equal((await catalog.publicMarketplace()).listings.length, 1);
    assert.equal((await catalog.publicMarketplace()).listings[0].details.productUrl, details.productUrl);
    const visible = (await catalog.publicMarketplace()).shops[0];
    assert.equal("owner_id" in visible, false);
    assert.equal(
      model.isSponsored({
        ...visible,
        sponsored_until: "2000-01-01T00:00:00Z",
      }),
      false,
    );
    session = { uid: "merchant-a", isAdmin: false };
    assert.equal(
      (
        await post({
          action: "availability",
          id: listingA.id,
          availability: "sold_out",
        })
      ).status,
      200,
    );
    assert.equal(
      (await catalog.publicMarketplace()).listings[0].details.availability,
      "sold_out",
    );
    await post({ action: "listing", id: listingA.id, details });
    assert.equal((await catalog.publicMarketplace()).listings.length, 0);
    session = { uid: "admin", isAdmin: true };
    await post({
      action: "moderate",
      kind: "listing",
      id: listingA.id,
      status: "approved",
    });
    await post({
      action: "moderate",
      kind: "shop",
      id: shopA.id,
      status: "suspended",
    });
    assert.equal((await catalog.publicMarketplace()).listings.length, 0);
    session = { uid: "merchant-a", isAdmin: false };
    assert.equal((await post({ action: "listing", details })).status, 403);
    await post({ action: "shop", profile });
    assert.equal((await (await get()).json()).shops[0].status, "suspended");
  } finally {
    await db.close();
  }
});

test("Photo upload requires owner session, validates content, strips metadata and limits storage", async () => {
  let session = null;
  let shop = { id: "shop-owner", status: "pending" };
  let uploaded = null;
  let count = 0;
  const sharp = require("sharp");
  const previous = process.env.BLOB_STORE_ID;
  process.env.BLOB_STORE_ID = "test-only";
  const api = load("src/app/api/marketplace/photos/route.ts", {
    "@/lib/auth": { getSession: async () => session },
    "@/lib/db": { queryOne: async (_, values) => { assert.equal(values[0], "owner"); return shop; } },
    "@vercel/blob": {
      list: async ({ prefix }) => { assert.equal(prefix, "marketplace/shop-owner/"); return { blobs: Array(count).fill({}), hasMore: false }; },
      put: async (pathname, bytes, options) => { uploaded = { pathname, bytes, options }; return { url: "https://store.public.blob.vercel-storage.com/photo.webp" }; },
    },
  });
  const request = (bytes, type = "image/png", origin = "https://shop.test") => {
    const data = new FormData(); data.set("photo", new Blob([bytes], { type }), "photo.png");
    return new NextRequest("https://shop.test/api/marketplace/photos", { method: "POST", headers: { origin }, body: data });
  };
  try {
    const png = await sharp({ create: { width: 2000, height: 1000, channels: 3, background: "green" } }).png().withMetadata().toBuffer();
    assert.equal((await api.POST(request(png))).status, 401);
    session = { uid: "owner" };
    assert.equal((await api.POST(request(png, "image/png", "https://foreign.test"))).status, 403);
    shop.status = "suspended";
    assert.equal((await api.POST(request(png))).status, 403);
    shop = null;
    assert.equal((await api.POST(request(png))).status, 403);
    shop = { id: "shop-owner", status: "pending" };
    assert.equal((await api.POST(request("<svg></svg>", "image/svg+xml"))).status, 400);
    assert.equal((await api.POST(request("not an image"))).status, 400);
    assert.equal((await api.POST(request(Buffer.alloc(3 * 1024 * 1024 + 1)))).status, 413);
    assert.equal(uploaded, null);
    assert.equal((await api.POST(request(png))).status, 201);
    assert.match(uploaded.pathname, /^marketplace\/shop-owner\/.+\.webp$/);
    assert.equal(uploaded.options.access, "public");
    const metadata = await sharp(uploaded.bytes).metadata();
    assert.equal(metadata.format, "webp"); assert.equal(metadata.width, 1600); assert.equal(metadata.exif, undefined);
    count = 100; uploaded = null;
    assert.equal((await api.POST(request(png))).status, 409);
    assert.equal(uploaded, null);
  } finally {
    if (previous === undefined) delete process.env.BLOB_STORE_ID; else process.env.BLOB_STORE_ID = previous;
  }
});

test("Optional external product links preserve older listings and reject unsafe URLs", () => {
  const { listingSchema, isProductUrl } = load("src/lib/marketplace-model.ts", {});
  const details = { title: "Onduleur", description: "Un onduleur solaire", category: "Solaire", price: 150000, image: "", availability: "available" };
  assert.equal(listingSchema.safeParse(details).success, true);
  for (const productUrl of ["", "https://example.com/produit?id=1"]) assert.equal(listingSchema.safeParse({ ...details, productUrl }).success, true);
  for (const productUrl of ["javascript:alert(1)", "http://example.com", "https://user:password@example.com", "not a link"]) {
    assert.equal(listingSchema.safeParse({ ...details, productUrl }).success, false);
    assert.equal(isProductUrl(productUrl), false);
  }
});
