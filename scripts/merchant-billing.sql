-- Preparation only. Apply on a preview database first. Does not enable billing.
BEGIN;
CREATE TABLE IF NOT EXISTS marketplace_memberships (
 shop_id text PRIMARY KEY REFERENCES marketplace_shops(id),
 plan_id text CHECK(plan_id IN ('starter','growth','pro')),
 state text NOT NULL DEFAULT 'inactive' CHECK(state IN ('legacy','inactive','active')),
 product_limit integer NOT NULL DEFAULT 0 CHECK(product_limit >= 0),
 valid_until timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
);
-- Existing shops keep their current access; reruns never replace an entitlement.
INSERT INTO marketplace_memberships(shop_id,state)
 SELECT id,'legacy' FROM marketplace_shops ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS marketplace_plan_requests (
 id text PRIMARY KEY, shop_id text NOT NULL REFERENCES marketplace_shops(id),
 plan_id text NOT NULL CHECK(plan_id IN ('starter','growth','pro')),
 product_limit integer NOT NULL CHECK(product_limit IN (10,30,100)),
 price_fcfa integer NOT NULL CHECK(price_fcfa IN (2000,5000,10000)),
 visibility text NOT NULL CHECK(visibility IN ('none','featured7','banner7')),
 note text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(), reviewed_at timestamptz, reviewed_by text,
 payment_reference text, paid_fcfa integer,
 CHECK((plan_id='starter' AND product_limit=10 AND price_fcfa=2000) OR
       (plan_id='growth' AND product_limit=30 AND price_fcfa=5000) OR
       (plan_id='pro' AND product_limit=100 AND price_fcfa=10000))
);
CREATE UNIQUE INDEX IF NOT EXISTS marketplace_one_pending_plan ON marketplace_plan_requests(shop_id) WHERE status='pending';
CREATE INDEX IF NOT EXISTS marketplace_plan_requests_created ON marketplace_plan_requests(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS marketplace_payment_reference_unique ON marketplace_plan_requests(lower(trim(payment_reference))) WHERE status='approved';
-- Create an inactive entitlement for new shops, including while the feature is off.
CREATE OR REPLACE FUNCTION marketplace_new_membership() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO marketplace_memberships(shop_id) VALUES(NEW.id) ON CONFLICT DO NOTHING;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS marketplace_new_membership ON marketplace_shops;
CREATE TRIGGER marketplace_new_membership AFTER INSERT ON marketplace_shops FOR EACH ROW EXECUTE FUNCTION marketplace_new_membership();

-- Row locking serializes quota checks, including simultaneous merchant/admin requests.
CREATE OR REPLACE FUNCTION marketplace_billable_listing(p_id text,p_shop text,p_details jsonb,p_status text,p_new boolean)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE m marketplace_memberships%ROWTYPE; current_status text; used integer;
BEGIN
 SELECT * INTO m FROM marketplace_memberships WHERE shop_id=p_shop FOR UPDATE;
 IF NOT FOUND THEN RETURN 'inactive'; END IF;
 IF NOT p_new THEN
  SELECT status INTO current_status FROM marketplace_listings WHERE id=p_id AND shop_id=p_shop;
  IF NOT FOUND THEN RETURN 'missing'; END IF;
 END IF;
 IF p_status NOT IN ('pending','approved','suspended') THEN RETURN 'invalid'; END IF;
 IF p_status <> 'suspended' AND m.state <> 'legacy' THEN
  IF m.state <> 'active' OR m.valid_until IS NULL OR m.valid_until <= now() THEN RETURN 'expired'; END IF;
  SELECT count(*) INTO used FROM marketplace_listings WHERE shop_id=p_shop AND status IN ('pending','approved') AND id<>p_id;
  IF used >= m.product_limit THEN RETURN 'quota'; END IF;
 END IF;
 IF p_new THEN
  INSERT INTO marketplace_listings(id,shop_id,details,status) VALUES(p_id,p_shop,p_details,p_status);
 ELSE
  UPDATE marketplace_listings SET details=COALESCE(p_details,details),status=p_status,updated_at=now() WHERE id=p_id AND shop_id=p_shop;
 END IF;
 RETURN 'ok';
END $$;

CREATE OR REPLACE FUNCTION marketplace_activate_plan(p_request text,p_admin text,p_paid integer,p_reference text)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE r marketplace_plan_requests%ROWTYPE; m marketplace_memberships%ROWTYPE; used integer; starts timestamptz;
BEGIN
 SELECT * INTO r FROM marketplace_plan_requests WHERE id=p_request FOR UPDATE;
 IF NOT FOUND THEN RETURN 'missing'; END IF;
 IF r.status <> 'pending' THEN RETURN 'reviewed'; END IF;
 IF p_paid <> r.price_fcfa OR length(trim(p_reference)) < 3 THEN RETURN 'payment'; END IF;
 SELECT * INTO m FROM marketplace_memberships WHERE shop_id=r.shop_id FOR UPDATE;
 IF NOT FOUND THEN RETURN 'missing'; END IF;
 IF m.state='active' AND m.valid_until > now() AND m.plan_id <> r.plan_id THEN RETURN 'plan_change'; END IF;
 SELECT count(*) INTO used FROM marketplace_listings WHERE shop_id=r.shop_id AND status IN ('pending','approved');
 IF used > r.product_limit THEN RETURN 'quota'; END IF;
 starts := CASE WHEN m.state='active' AND m.valid_until > now() THEN m.valid_until ELSE now() END;
 UPDATE marketplace_memberships SET plan_id=r.plan_id,state='active',product_limit=r.product_limit,valid_until=((starts at time zone 'Africa/Dakar')+interval '1 month') at time zone 'Africa/Dakar',updated_at=now() WHERE shop_id=r.shop_id;
 UPDATE marketplace_plan_requests SET status='approved',reviewed_at=now(),reviewed_by=p_admin,paid_fcfa=p_paid,payment_reference=trim(p_reference) WHERE id=p_request;
 RETURN 'ok';
EXCEPTION WHEN unique_violation THEN RETURN 'payment_used';
END $$;
COMMIT;
