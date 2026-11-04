BEGIN;
CREATE TABLE IF NOT EXISTS advertising_campaigns (
 id uuid PRIMARY KEY, title text NOT NULL, image_url text NOT NULL, target_url text NOT NULL,
 placement text NOT NULL CHECK (placement IN ('home','catalog','shops')),
 category text NOT NULL DEFAULT '', starts_on date, ends_on date,
 active boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (ends_on IS NULL OR starts_on IS NULL OR ends_on >= starts_on)
);
CREATE TABLE IF NOT EXISTS engagement_events (
 id uuid PRIMARY KEY, campaign_id uuid REFERENCES advertising_campaigns(id),
 kind text NOT NULL CHECK (kind IN ('ad_view','ad_click','whatsapp_click','shop_view','checkout_open')),
 placement text NOT NULL CHECK (placement IN ('home','catalog','shops','other')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS engagement_events_date_idx ON engagement_events(created_at);
CREATE INDEX IF NOT EXISTS engagement_events_campaign_idx ON engagement_events(campaign_id,created_at);
ALTER TABLE advertising_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;
COMMIT;
