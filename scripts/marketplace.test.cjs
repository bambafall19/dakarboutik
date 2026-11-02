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
