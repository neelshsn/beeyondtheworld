BEGIN;
CREATE TABLE IF NOT EXISTS bee_creative_access (
 email text PRIMARY KEY, role text NOT NULL CHECK(role IN ('bee','curator','production','contributor','viewer')), demo_only boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS bee_creative_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), scope text NOT NULL CHECK(scope IN ('studio','demo')),
 kind text NOT NULL CHECK(kind IN ('talent','destination','content','collection','activation')),
 title text NOT NULL, status text NOT NULL DEFAULT 'draft', data jsonb NOT NULL DEFAULT '{}',
 version integer NOT NULL DEFAULT 1, created_by text NOT NULL, updated_by text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bee_creative_scope_kind ON bee_creative_items(scope,kind);
CREATE TABLE IF NOT EXISTS bee_creative_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid NOT NULL REFERENCES bee_creative_items(id),
 actor text NOT NULL, action text NOT NULL, snapshot jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bee_creative_files (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid NOT NULL REFERENCES bee_creative_items(id),
 name text NOT NULL, mime text NOT NULL, bytes bytea NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO bee_creative_access(email,role) VALUES ('rachid@beeyondtheworld.com','bee'),('eugenie@beeyondtheworld.com','curator'),('maria@beeyondtheworld.com','contributor') ON CONFLICT DO NOTHING;
COMMIT;
