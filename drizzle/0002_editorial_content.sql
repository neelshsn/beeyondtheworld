CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL UNIQUE,
  "password_hash" text,
  "setup_token" text,
  "setup_token_expires_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "admin_users"
  ALTER COLUMN "password_hash" DROP NOT NULL;

ALTER TABLE "admin_users"
  ADD COLUMN IF NOT EXISTS "setup_token" text;

ALTER TABLE "admin_users"
  ADD COLUMN IF NOT EXISTS "setup_token_expires_at" timestamp;

CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_setup_token_idx"
  ON "admin_users" ("setup_token");

CREATE TABLE IF NOT EXISTS "admin_sessions" (
  "token" text PRIMARY KEY NOT NULL,
  "admin_user_id" integer NOT NULL REFERENCES "admin_users"("id") ON DELETE CASCADE,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "content_documents" (
  "id" serial PRIMARY KEY NOT NULL,
  "kind" text NOT NULL,
  "slug" text NOT NULL,
  "draft" jsonb NOT NULL,
  "published" jsonb,
  "revision" integer DEFAULT 1 NOT NULL,
  "published_revision" integer DEFAULT 0 NOT NULL,
  "position" integer DEFAULT 0 NOT NULL,
  "archived" boolean DEFAULT false NOT NULL,
  "updated_by" text,
  "published_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "content_documents_kind_slug_idx"
  ON "content_documents" ("kind", "slug");

CREATE TABLE IF NOT EXISTS "media_assets" (
  "id" serial PRIMARY KEY NOT NULL,
  "url" text NOT NULL UNIQUE,
  "pathname" text NOT NULL UNIQUE,
  "original_name" text NOT NULL,
  "content_type" text NOT NULL,
  "media_type" text NOT NULL,
  "size" integer DEFAULT 0 NOT NULL,
  "uploaded_by" text,
  "archived_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
