BEGIN;
CREATE TABLE IF NOT EXISTS marketplace_shop_alerts (
 shop_id text PRIMARY KEY REFERENCES marketplace_shops(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now(),
 email_status text NOT NULL DEFAULT 'queued' CHECK(email_status IN ('queued','sending','sent','failed','unconfigured')),
 attempts integer NOT NULL DEFAULT 0,
 last_attempt_at timestamptz,
 sent_at timestamptz
);
ALTER TABLE marketplace_shop_alerts ENABLE ROW LEVEL SECURITY;
COMMIT;
