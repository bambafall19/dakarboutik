BEGIN;
CREATE TABLE IF NOT EXISTS media (id text PRIMARY KEY,name text NOT NULL DEFAULT '',url text NOT NULL,kind text NOT NULL DEFAULT 'image',created_at timestamptz NOT NULL DEFAULT now(),data bytea,content_type text,size integer,original_name text);
CREATE UNIQUE INDEX IF NOT EXISTS media_url_idx ON media(url);
CREATE TABLE IF NOT EXISTS contact_messages (id text PRIMARY KEY,name text NOT NULL DEFAULT '',email text NOT NULL DEFAULT '',subject text NOT NULL DEFAULT '',message text NOT NULL DEFAULT '',is_read boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
COMMIT;
