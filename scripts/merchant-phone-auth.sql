-- Additive migration: existing Neon accounts and shops are unchanged.
BEGIN;
CREATE TABLE IF NOT EXISTS merchant_phone_accounts (
 id text PRIMARY KEY, phone text NOT NULL UNIQUE, name text NOT NULL,
 contact_email text, password_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS merchant_phone_sessions (
 token_hash text PRIMARY KEY, account_id text NOT NULL REFERENCES merchant_phone_accounts(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS merchant_phone_sessions_account_idx ON merchant_phone_sessions(account_id);
CREATE TABLE IF NOT EXISTS merchant_auth_limits (
 key text PRIMARY KEY, attempts integer NOT NULL, expires_at timestamptz NOT NULL
);
-- No Data API access: server database owner only.
ALTER TABLE merchant_phone_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_phone_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_auth_limits ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS merchant_phone_sessions_expiry_idx ON merchant_phone_sessions(expires_at);
CREATE INDEX IF NOT EXISTS merchant_auth_limits_expiry_idx ON merchant_auth_limits(expires_at);
COMMIT;
