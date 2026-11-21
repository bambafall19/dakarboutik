-- Future products only. Existing listings and campaigns are deliberately not backfilled.
BEGIN;
CREATE TABLE IF NOT EXISTS advertising_product_automation (
 listing_id text PRIMARY KEY REFERENCES marketplace_listings(id) ON DELETE CASCADE,
 campaign_id uuid UNIQUE REFERENCES advertising_campaigns(id) ON DELETE SET NULL,
 manual_pause boolean NOT NULL DEFAULT false
);
ALTER TABLE advertising_campaigns ADD COLUMN IF NOT EXISTS auto_product_id text;
CREATE UNIQUE INDEX IF NOT EXISTS advertising_auto_product_idx ON advertising_campaigns(auto_product_id) WHERE auto_product_id IS NOT NULL;

CREATE OR REPLACE FUNCTION advertising_text_units(value text) RETURNS integer LANGUAGE sql IMMUTABLE AS $$
 SELECT coalesce(sum(CASE WHEN octet_length(ch)>3 THEN 2 ELSE 1 END),0)::integer FROM regexp_split_to_table(coalesce(value,''),'') ch;
$$;
CREATE OR REPLACE FUNCTION advertising_fit_text(value text,maximum integer) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE result text:=''; units integer:=0; ch text; weight integer;
BEGIN
 FOR ch IN SELECT regexp_split_to_table(coalesce(value,''),'') LOOP
  weight:=CASE WHEN octet_length(ch)>3 THEN 2 ELSE 1 END;
  EXIT WHEN units+weight>maximum;
  result:=result||ch; units:=units+weight;
 END LOOP;
 RETURN result;
END $$;

CREATE OR REPLACE FUNCTION advertising_sync_product(p_listing text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE l marketplace_listings%ROWTYPE; s marketplace_shops%ROWTYPE; a advertising_product_automation%ROWTYPE;
 visible boolean; target text; price_text text; prefix text; suffix text; headline text; previous_setting text;
BEGIN
 SELECT * INTO a FROM advertising_product_automation WHERE listing_id=p_listing FOR UPDATE;
 IF NOT FOUND THEN RETURN; END IF;
 SELECT * INTO l FROM marketplace_listings WHERE id=p_listing;
 IF NOT FOUND THEN RETURN; END IF;
 SELECT * INTO s FROM marketplace_shops WHERE id=l.shop_id;
 visible := l.status='approved' AND s.status='approved' AND coalesce(l.details->>'availability','')<>'sold_out' AND coalesce(l.details->>'image','') LIKE 'https://%';
 target := '/boutiques/'||l.shop_id||'/produits/'||l.id;
 IF a.campaign_id IS NULL AND NOT visible THEN RETURN; END IF;
 -- A manual campaign aimed at the product remains entirely manual; do not duplicate it.
 IF a.campaign_id IS NULL AND EXISTS (SELECT 1 FROM advertising_campaigns WHERE placement='home' AND split_part(split_part(target_url,'?',1),'#',1) IN (target,'https://dakarboutik.net'||target,'https://www.dakarboutik.net'||target)) THEN RETURN; END IF;
 price_text := regexp_replace(replace(replace(to_char((l.details->>'price')::numeric,'FM999G999G999G990D00'),',',' '),'.',','),',00$','');
 prefix := '✨ Nouveauté '||advertising_fit_text(s.profile->>'name',24)||' · ';
 suffix := ' · '||price_text||' FCFA';
 headline := prefix||advertising_fit_text(l.details->>'title',greatest(3,120-advertising_text_units(prefix)-advertising_text_units(suffix)))||suffix;
 previous_setting := current_setting('dakarboutik.automatic_ad_sync',true);
 PERFORM set_config('dakarboutik.automatic_ad_sync','on',true);
 IF a.campaign_id IS NULL THEN
  INSERT INTO advertising_campaigns(id,title,image_url,target_url,placement,category,active,sort_order,auto_product_id)
   VALUES(gen_random_uuid(),headline,l.details->>'image',target,'home','',true,1000,l.id) RETURNING id INTO a.campaign_id;
  UPDATE advertising_product_automation SET campaign_id=a.campaign_id WHERE listing_id=l.id;
 ELSE
  UPDATE advertising_campaigns SET title=headline,image_url=l.details->>'image',target_url=target,active=visible AND NOT a.manual_pause WHERE id=a.campaign_id;
 END IF;
 PERFORM set_config('dakarboutik.automatic_ad_sync',coalesce(previous_setting,''),true);
END $$;

CREATE OR REPLACE FUNCTION advertising_product_changed() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='INSERT' THEN INSERT INTO advertising_product_automation(listing_id) VALUES(NEW.id) ON CONFLICT DO NOTHING; END IF;
 PERFORM advertising_sync_product(NEW.id);
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS advertising_new_product ON marketplace_listings;
CREATE TRIGGER advertising_new_product AFTER INSERT OR UPDATE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION advertising_product_changed();

CREATE OR REPLACE FUNCTION advertising_product_removed() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 -- Pause and retain the campaign so its engagement history remains available.
 PERFORM set_config('dakarboutik.automatic_ad_sync','on',true);
 UPDATE advertising_campaigns SET active=false WHERE auto_product_id=OLD.id;
 PERFORM set_config('dakarboutik.automatic_ad_sync','',true);
 RETURN OLD;
END $$;
DROP TRIGGER IF EXISTS advertising_deleted_product ON marketplace_listings;
CREATE TRIGGER advertising_deleted_product BEFORE DELETE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION advertising_product_removed();

CREATE OR REPLACE FUNCTION advertising_shop_changed() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE item record;
BEGIN
 FOR item IN SELECT a.listing_id FROM advertising_product_automation a JOIN marketplace_listings l ON l.id=a.listing_id WHERE l.shop_id=NEW.id LOOP
  PERFORM advertising_sync_product(item.listing_id);
 END LOOP;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS advertising_shop_status ON marketplace_shops;
CREATE TRIGGER advertising_shop_status AFTER UPDATE OF profile,status ON marketplace_shops FOR EACH ROW EXECUTE FUNCTION advertising_shop_changed();

CREATE OR REPLACE FUNCTION advertising_manual_pause() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.auto_product_id IS NOT NULL AND current_setting('dakarboutik.automatic_ad_sync',true) IS DISTINCT FROM 'on' THEN
  UPDATE advertising_product_automation SET manual_pause=NOT NEW.active WHERE campaign_id=NEW.id;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS advertising_respect_manual_pause ON advertising_campaigns;
CREATE TRIGGER advertising_respect_manual_pause AFTER UPDATE OF active ON advertising_campaigns FOR EACH ROW EXECUTE FUNCTION advertising_manual_pause();
ALTER TABLE advertising_product_automation ENABLE ROW LEVEL SECURITY;
COMMIT;
