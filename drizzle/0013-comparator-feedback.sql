-- Shared design review, independent from production workflow records.
CREATE TABLE IF NOT EXISTS bee_review_access (
  token_hash text PRIMARY KEY CHECK (length(token_hash)=64),
  author text NOT NULL CHECK (author IN ('eugenie','rachid')),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bee_review_feedback (
  role text NOT NULL,
  page text NOT NULL,
  author text NOT NULL CHECK (author IN ('eugenie','rachid')),
  body text NOT NULL DEFAULT '' CHECK (length(body)<=15000),
  version integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(role,page,author)
);
CREATE TABLE IF NOT EXISTS bee_review_images (
  id uuid PRIMARY KEY,
  role text NOT NULL,
  page text NOT NULL,
  author text NOT NULL,
  name text NOT NULL,
  content bytea NOT NULL,
  size integer NOT NULL CHECK(size BETWEEN 1 AND 3145728),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  FOREIGN KEY(role,page,author) REFERENCES bee_review_feedback(role,page,author)
);
CREATE INDEX IF NOT EXISTS bee_review_images_screen ON bee_review_images(role,page) WHERE deleted_at IS NULL;
