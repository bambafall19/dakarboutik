CREATE TABLE IF NOT EXISTS engagement_attribution (
 event_id uuid PRIMARY KEY REFERENCES engagement_events(id) ON DELETE CASCADE,
 audience text NOT NULL CHECK (audience IN ('partner','support','legacy')),
 shop_id text,
 CHECK ((audience='partner') = (shop_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS engagement_attribution_shop_idx ON engagement_attribution(shop_id);
ALTER TABLE engagement_attribution ENABLE ROW LEVEL SECURITY;
