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

test("Marketplace filters match category case, accents and spacing", () => {
  const { normalizeMarketplaceText: normalize } = load("src/lib/marketplace-model.ts", {});
  assert.equal(normalize(" SOLAIRE "), normalize("Solaire"));
  assert.equal(normalize("Téléphones"), normalize("TELEPHONES"));
  assert.equal(normalize("  Onduleur   hybride 5KW "), "onduleur hybride 5kw");
  assert.ok(normalize("Onduleur hybride 5KW SOLAIRE MMD TECH Dakar MBAO").includes(normalize("solaire")));
  assert.notEqual(normalize("Solaire"), normalize("Maison"));
});

test("Official solar and phone products map to public categories", () => {
  const { matchesMarketplaceCategory: match } = load("src/lib/marketplace-model.ts", {});
  const battery = { title: "Batterie lithium 50 kWh", category: "electricite-energie-and-securite" };
  const inverter = { title: "Master U-Power Inverseur Chargeur Hybride PMS Top 5000 W", category: "electricite-energie-and-securite" };
  const phone = { title: "IPhone 16 pro max", category: "electronique-and-technologies" };
  assert.equal(match(battery, "Solaire"), true);
  assert.equal(match(inverter, "Solaire"), true);
  assert.equal(match(phone, "Téléphones"), true);
  assert.equal(match(phone, "Solaire"), false);
  assert.equal(match(battery, "Téléphones"), false);
  assert.equal(match(inverter, "Téléphones"), false);
  assert.equal(match({ title: "Routeur WiFi", category: "electronique-and-technologies" }, "Téléphones"), false);
  assert.equal(match(phone, ""), true);
});


test("Phone accounts: normalization, hashed sessions, isolation, revocation and durable throttling", async () => {
  const db = new PGlite();
  const jar = new Map();
  const cookieOptions = [];
  try {
    const migration = fs.readFileSync(path.join(__dirname, "merchant-phone-auth.sql"), "utf8");
    await db.exec(migration); await db.exec(migration);
    const adapter = {
      query: async (sql, values = []) => (await db.query(sql, values)).rows,
      queryOne: async (sql, values = []) => (await db.query(sql, values)).rows[0] ?? null,
    };
    const phone = load("src/lib/merchant-phone-auth.ts", {
      "server-only": {}, "@/lib/db": adapter,
      "next/headers": { cookies: async () => ({ get: key => jar.has(key) ? { value: jar.get(key) } : undefined,
        set: (key, value, options) => { cookieOptions.push(options); if (value) jar.set(key, value); else jar.delete(key); } }) },
    });
    assert.equal(phone.normalizePhone("77 123 45 67"), "+221771234567");
    assert.equal(phone.normalizePhone("00221 77 123 45 67"), "+221771234567");
    assert.equal(phone.normalizePhone("+33 6 12 34 56 78"), "+33612345678");
    assert.equal(phone.normalizePhone("abc771234567"), null);
    assert.equal(phone.normalizePhone("123"), null);
    const register = { action: "register-phone", phone: "77 123 45 67", name: "Test", password: "six123", email: "admin@example.test" };
    assert.equal((await phone.authenticatePhone({ ...register, password: "short" })).status, 400);
    assert.equal((await phone.authenticatePhone(register)).status, 200);
    const session = await phone.phoneSession();
    assert.equal(session.isAdmin, false); assert.equal(session.email, ""); assert.equal(session.phone, "+221771234567");
    const saved = (await db.query("select * from merchant_phone_accounts")).rows[0];
    assert.notEqual(saved.password_hash, register.password);
    assert.equal(saved.contact_email, "admin@example.test");
    const token = jar.get(phone.phoneCookie);
    const savedSession = (await db.query("select * from merchant_phone_sessions")).rows[0];
    assert.notEqual(savedSession.token_hash, token);
    assert.equal(cookieOptions.at(-1).httpOnly, true); assert.equal(cookieOptions.at(-1).sameSite, "lax");
    assert.equal((await phone.authenticatePhone({ ...register, phone: "+221771234567" })).status, 409);
    await phone.clearPhoneSession(); assert.equal(await phone.phoneSession(), null);
    jar.set(phone.phoneCookie, token); assert.equal(await phone.phoneSession(), null);
    const login = { action: "login-phone", phone: "+221771234567", password: "six123" };
    assert.equal((await phone.authenticatePhone({ ...login, password: "wrong1" })).status, 401);
    assert.equal((await phone.authenticatePhone(login)).status, 200);
    assert.equal((await phone.phoneSession()).uid, session.uid);
    await db.exec("update merchant_phone_sessions set expires_at=now()-interval '1 second'");
    assert.equal(await phone.phoneSession(), null);
    await phone.clearPhoneSession();
    assert.equal((await phone.authenticatePhone({ ...register, phone: "78 123 45 67", email: "" })).status, 200);
    assert.notEqual((await phone.phoneSession()).uid, session.uid);
    assert.equal((await db.query("select contact_email from merchant_phone_accounts where phone='+221781234567'")).rows[0].contact_email, null);
    assert.equal(await phone.consumePhoneLimit("test", 1, 900), true);
    assert.equal(await phone.consumePhoneLimit("test", 1, 900), false);
    await db.exec("update merchant_auth_limits set expires_at=now()-interval '1 second'");
    assert.equal(await phone.consumePhoneLimit("test", 1, 900), true);
    const route = load("src/app/api/auth/session/route.ts", { "@/lib/db": adapter,
      "@/lib/auth": { getSession: async () => session, destroySession: async () => phone.clearPhoneSession() },
      "@/lib/merchant-phone-auth": phone });
    const publicSession = await (await route.GET()).json();
    assert.equal(publicSession.user.isAdmin, false); assert.equal(publicSession.user.id, session.uid);
    const post = (body, origin="https://shop.test") => route.POST(new NextRequest("https://shop.test/api/auth/session", {
      method: "POST", headers: { origin, "content-type": "application/json", "x-forwarded-for": "192.0.2.1" }, body: JSON.stringify(body) }));
    assert.equal((await post(login, "https://evil.test")).status, 403);
    assert.equal((await post({ action: "make-admin" })).status, 400);
    assert.equal((await post(login)).status, 200);
    assert.equal((await post({ action: "change-phone-password", oldPassword: "wrong", newPassword: "new123" })).status, 401);
    assert.equal((await post({ action: "change-phone-password", oldPassword: "six123", newPassword: "new123" })).status, 200);
    assert.equal((await phone.authenticatePhone(login)).status, 401);
    assert.equal((await phone.authenticatePhone({ ...login, password: "new123" })).status, 200);
    assert.equal((await post({ action: "logout" })).status, 200);
    assert.equal(await phone.phoneSession(), null);
  } finally { await db.close(); }
});
