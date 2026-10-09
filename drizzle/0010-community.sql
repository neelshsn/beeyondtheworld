-- Additive Community schema; independent of the editorial CMS and its administrators.
CREATE TABLE IF NOT EXISTS bee_community_users (
  id uuid PRIMARY KEY, email text NOT NULL UNIQUE, name text NOT NULL,
  organization text NOT NULL, password_hash text NOT NULL,
  disabled boolean NOT NULL DEFAULT false, is_test boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bee_community_sessions (
  token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES bee_community_users(id),
  expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bee_community_login_limits (
  key text PRIMARY KEY, attempts integer NOT NULL, window_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS bee_community_projects (
  id uuid PRIMARY KEY, title text NOT NULL, territory text NOT NULL,
  season text NOT NULL, starts_on date, ends_on date,
  is_demo boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bee_community_members (
  project_id uuid NOT NULL REFERENCES bee_community_projects(id),
  user_id uuid NOT NULL REFERENCES bee_community_users(id),
  role text NOT NULL CHECK (role IN ('bee','brand','production','art_director','stylist','photographer','filmmaker','beauty','editor','ngo','expert')),
  PRIMARY KEY(project_id,user_id)
);
CREATE TABLE IF NOT EXISTS bee_community_records (
  id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES bee_community_projects(id),
  kind text NOT NULL, title text NOT NULL, status text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}', organization text NOT NULL,
  created_by uuid NOT NULL REFERENCES bee_community_users(id),
  version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bee_community_record_project_idx ON bee_community_records(project_id,kind);
CREATE TABLE IF NOT EXISTS bee_community_events (
  id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES bee_community_projects(id),
  record_id uuid NOT NULL REFERENCES bee_community_records(id),
  actor_id uuid NOT NULL REFERENCES bee_community_users(id), action text NOT NULL,
  previous_state text, new_state text NOT NULL, comment text NOT NULL DEFAULT '',
  snapshot jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bee_community_event_project_idx ON bee_community_events(project_id,created_at DESC);
CREATE TABLE IF NOT EXISTS bee_community_files (
  id uuid PRIMARY KEY, record_id uuid NOT NULL REFERENCES bee_community_records(id),
  name text NOT NULL, mime text NOT NULL, size integer NOT NULL CHECK (size <= 3145728),
  content bytea NOT NULL, sha256 text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
