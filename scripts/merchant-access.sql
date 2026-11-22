-- Additive: no existing account, shop, password or product is changed by migration.
CREATE TABLE IF NOT EXISTS merchant_access_links (
 token_hash text PRIMARY KEY CHECK(token_hash ~ '^[a-f0-9]{64}$'),
 shop_id text NOT NULL REFERENCES marketplace_shops(id),
 owner_snapshot text NOT NULL,
 phone text NOT NULL,
 created_by text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL,
 used_at timestamptz
);
ALTER TABLE merchant_access_links ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS merchant_access_links_shop_idx ON merchant_access_links(shop_id);

CREATE OR REPLACE FUNCTION issue_merchant_access_link(p_shop text,p_hash text,p_admin text)
RETURNS text LANGUAGE plpgsql AS $access$
DECLARE s marketplace_shops%ROWTYPE; account_id text; target_phone text;
BEGIN
 SELECT * INTO s FROM marketplace_shops WHERE id=p_shop FOR UPDATE;
 IF NOT FOUND OR s.status='suspended' THEN RETURN NULL; END IF;
 target_phone := '+' || (s.profile->>'whatsapp');
 IF target_phone IS NULL OR target_phone !~ '^\+[1-9][0-9]{7,14}$' THEN RETURN NULL; END IF;
 SELECT id INTO account_id FROM merchant_phone_accounts WHERE phone=target_phone;
 IF account_id IS NOT NULL AND EXISTS(SELECT 1 FROM marketplace_shops WHERE owner_id=account_id AND id<>p_shop) THEN RETURN NULL; END IF;
 UPDATE merchant_access_links SET used_at=clock_timestamp() WHERE shop_id=p_shop AND used_at IS NULL;
 INSERT INTO merchant_access_links(token_hash,shop_id,owner_snapshot,phone,created_by,expires_at)
 VALUES(p_hash,p_shop,s.owner_id,target_phone,p_admin,clock_timestamp()+interval '30 minutes');
 RETURN target_phone;
END;
$access$;

CREATE OR REPLACE FUNCTION consume_merchant_access_link(p_hash text,p_password_hash text)
RETURNS boolean LANGUAGE plpgsql AS $access$
DECLARE link merchant_access_links%ROWTYPE; s marketplace_shops%ROWTYPE; v_account_id text;
BEGIN
 SELECT * INTO link FROM merchant_access_links WHERE token_hash=p_hash AND used_at IS NULL FOR UPDATE;
 IF NOT FOUND OR link.expires_at<=clock_timestamp() THEN RETURN false; END IF;
 SELECT * INTO s FROM marketplace_shops WHERE id=link.shop_id FOR UPDATE;
 IF NOT FOUND OR s.status='suspended' OR s.owner_id<>link.owner_snapshot OR ('+'||(s.profile->>'whatsapp')) IS DISTINCT FROM link.phone THEN RETURN false; END IF;
 -- Serialize recovery for this phone even when it has no account yet.
 PERFORM pg_advisory_xact_lock(hashtextextended(link.phone,0));
 SELECT id INTO v_account_id FROM merchant_phone_accounts WHERE phone=link.phone FOR UPDATE;
 IF v_account_id IS NOT NULL AND EXISTS(SELECT 1 FROM marketplace_shops WHERE owner_id=v_account_id AND id<>s.id) THEN RETURN false; END IF;
 IF link.expires_at<=clock_timestamp() THEN RETURN false; END IF;
 IF v_account_id IS NULL THEN
   INSERT INTO merchant_phone_accounts(id,phone,name,password_hash)
   VALUES(gen_random_uuid()::text,link.phone,s.profile->>'name',p_password_hash)
   ON CONFLICT(phone) DO NOTHING;
   SELECT id INTO v_account_id FROM merchant_phone_accounts WHERE phone=link.phone FOR UPDATE;
   IF EXISTS(SELECT 1 FROM marketplace_shops WHERE owner_id=v_account_id AND id<>s.id) THEN RAISE EXCEPTION 'Phone already assigned'; END IF;
 END IF;
 UPDATE merchant_phone_accounts SET password_hash=p_password_hash WHERE id=v_account_id;
 DELETE FROM merchant_phone_sessions WHERE account_id=v_account_id;
 UPDATE marketplace_shops SET owner_id=v_account_id WHERE id=s.id;
 UPDATE merchant_access_links SET used_at=clock_timestamp() WHERE token_hash=p_hash;
 RETURN true;
END;
$access$;
-- Only the server database owner can invoke these credential-changing functions.
REVOKE ALL ON FUNCTION issue_merchant_access_link(text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION consume_merchant_access_link(text,text) FROM PUBLIC;
