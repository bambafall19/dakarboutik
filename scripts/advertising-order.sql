-- Adds a display priority without changing campaign dates, activation or statistics.
BEGIN;
DO $$
BEGIN
 PERFORM pg_advisory_xact_lock(92877310);
 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='advertising_campaigns' AND column_name='sort_order') THEN
  ALTER TABLE advertising_campaigns ADD COLUMN sort_order integer NOT NULL DEFAULT 1000 CHECK (sort_order BETWEEN 1 AND 9999);
  WITH ranked AS (SELECT id,row_number() OVER (ORDER BY created_at DESC,id)::integer AS position FROM advertising_campaigns)
  UPDATE advertising_campaigns c SET sort_order=ranked.position FROM ranked WHERE c.id=ranked.id;
 END IF;
END $$;
COMMIT;
