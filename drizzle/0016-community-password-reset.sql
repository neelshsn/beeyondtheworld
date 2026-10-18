BEGIN;
CREATE TABLE IF NOT EXISTS bee_community_password_resets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES bee_community_users(id),
 token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
 password_fingerprint text NOT NULL,
 created_by text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL,
 used_at timestamptz,
 revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS bee_community_password_resets_user ON bee_community_password_resets(user_id);
COMMIT;
