-- Run once before enabling MARKETPLACE_ENABLED=true. Does not alter existing commerce tables.
BEGIN;
CREATE TABLE IF NOT EXISTS marketplace_shops (
 id text PRIMARY KEY, owner_id text NOT NULL UNIQUE,
 profile jsonb NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','suspended')),
 sponsored_until timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS marketplace_listings (
 id text PRIMARY KEY, shop_id text NOT NULL REFERENCES marketplace_shops(id),
 details jsonb NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','suspended')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS marketplace_listings_shop_idx ON marketplace_listings(shop_id);
CREATE INDEX IF NOT EXISTS marketplace_listings_status_idx ON marketplace_listings(status);
COMMIT;
