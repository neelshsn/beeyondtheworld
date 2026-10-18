BEGIN;

CREATE TABLE IF NOT EXISTS bee_ecosystem_creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('studio','demo')),
  user_id uuid REFERENCES bee_community_users(id),
  email text NOT NULL,
  display_name text NOT NULL,
  home_destination text NOT NULL DEFAULT '',
  portfolio_url text NOT NULL DEFAULT '',
  biography text NOT NULL DEFAULT '',
  languages text[] NOT NULL DEFAULT '{}',
  covered_destinations text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','review','approved','active','declined','suspended')),
  royalty_rate_bps integer NOT NULL DEFAULT 200 CHECK (royalty_rate_bps = 200),
  royalty_status text NOT NULL DEFAULT 'proposed_to_contract'
    CHECK (royalty_status = 'proposed_to_contract'),
  contract_reference text,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(scope,user_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS bee_ecosystem_creator_scope_email
  ON bee_ecosystem_creators(scope,lower(email));

CREATE TABLE IF NOT EXISTS bee_ecosystem_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('studio','demo')),
  creator_id uuid NOT NULL REFERENCES bee_ecosystem_creators(id),
  email text NOT NULL,
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  created_by uuid NOT NULL REFERENCES bee_community_users(id),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bee_ecosystem_invitation_creator
  ON bee_ecosystem_invitations(creator_id,created_at DESC);

CREATE TABLE IF NOT EXISTS bee_ecosystem_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('studio','demo')),
  title text NOT NULL,
  country text NOT NULL,
  territory text NOT NULL,
  description text NOT NULL DEFAULT '',
  creative_direction_approved boolean NOT NULL DEFAULT false,
  production_approved boolean NOT NULL DEFAULT false,
  global_budget_reference text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL REFERENCES bee_community_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bee_ecosystem_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('studio','demo')),
  destination_id uuid NOT NULL REFERENCES bee_ecosystem_destinations(id),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','in_review','ready','published')),
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL REFERENCES bee_community_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bee_ecosystem_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('studio','demo')),
  kit_id uuid NOT NULL REFERENCES bee_ecosystem_kits(id),
  destination_id uuid NOT NULL REFERENCES bee_ecosystem_destinations(id),
  creator_id uuid REFERENCES bee_ecosystem_creators(id),
  slot text NOT NULL CHECK (slot IN ('hero','reel','photo')),
  slot_index integer NOT NULL CHECK (
    (slot='hero' AND slot_index=1) OR
    (slot='reel' AND slot_index BETWEEN 1 AND 3) OR
    (slot='photo' AND slot_index BETWEEN 1 AND 10)
  ),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  credit text NOT NULL DEFAULT '',
  rights_summary text NOT NULL DEFAULT '',
  rights_evidence text NOT NULL DEFAULT '',
  rights_scope text NOT NULL DEFAULT 'brand_presentation'
    CHECK (rights_scope IN ('brand_presentation','public_journeys')),
  rights_expires_at date,
  original_source_url text NOT NULL DEFAULT '',
  ai_disclosure text NOT NULL DEFAULT 'none_declared'
    CHECK (ai_disclosure IN ('none_declared','retouching_only','ai_assisted','ai_generated')),
  soft_fade_consent boolean NOT NULL DEFAULT false,
  width integer CHECK (width IS NULL OR width BETWEEN 1 AND 100000),
  height integer CHECK (height IS NULL OR height BETWEEN 1 AND 100000),
  duration_seconds numeric(6,2),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','studio_review','needs_replacement','rejected','approved','published')),
  authenticity text NOT NULL DEFAULT 'pending' CHECK (authenticity IN ('pending','approved','rejected')),
  rights_review text NOT NULL DEFAULT 'pending' CHECK (rights_review IN ('pending','approved','rejected')),
  safety text NOT NULL DEFAULT 'pending' CHECK (safety IN ('pending','approved','rejected')),
  human_creative text NOT NULL DEFAULT 'pending' CHECK (human_creative IN ('pending','approved','rejected')),
  review_note text NOT NULL DEFAULT '',
  active_media_id uuid,
  public_media_id uuid,
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL REFERENCES bee_community_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(kit_id,slot,slot_index)
);

CREATE TABLE IF NOT EXISTS bee_ecosystem_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('studio','demo')),
  asset_id uuid NOT NULL REFERENCES bee_ecosystem_assets(id),
  owner_user_id uuid NOT NULL REFERENCES bee_community_users(id),
  purpose text NOT NULL DEFAULT 'original' CHECK (purpose IN ('original','public_rendition')),
  source_media_id uuid REFERENCES bee_ecosystem_media(id),
  name text NOT NULL,
  mime text NOT NULL CHECK (mime IN ('image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm')),
  size bigint NOT NULL CHECK (size > 0 AND size <= 209715200),
  sha256 text CHECK (sha256 IS NULL OR sha256 ~ '^[a-f0-9]{64}$'),
  storage_state text NOT NULL DEFAULT 'uploading' CHECK (storage_state IN ('uploading','complete','aborted')),
  chunk_size integer NOT NULL DEFAULT 2097152 CHECK (chunk_size BETWEEN 262144 AND 2097152),
  chunk_count integer NOT NULL CHECK (chunk_count > 0 AND chunk_count <= 100),
  received_chunks integer NOT NULL DEFAULT 0 CHECK (received_chunks >= 0),
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS bee_ecosystem_media_chunks (
  media_id uuid NOT NULL REFERENCES bee_ecosystem_media(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL CHECK (chunk_index >= 0 AND chunk_index < 100),
  size integer NOT NULL CHECK (size > 0 AND size <= 2097152),
  sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  bytes bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(media_id,chunk_index)
);

DO $constraints$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bee_ecosystem_assets_active_media_fk') THEN
    ALTER TABLE bee_ecosystem_assets
      ADD CONSTRAINT bee_ecosystem_assets_active_media_fk
      FOREIGN KEY(active_media_id) REFERENCES bee_ecosystem_media(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bee_ecosystem_assets_public_media_fk') THEN
    ALTER TABLE bee_ecosystem_assets
      ADD CONSTRAINT bee_ecosystem_assets_public_media_fk
      FOREIGN KEY(public_media_id) REFERENCES bee_ecosystem_media(id);
  END IF;
END $constraints$;

CREATE TABLE IF NOT EXISTS bee_ecosystem_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('studio','demo')),
  destination_id uuid NOT NULL REFERENCES bee_ecosystem_destinations(id),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('association','territorial','hospitality','food','transport','guide','artisan','venue','local_producer')),
  description text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  collaboration_type text NOT NULL DEFAULT 'paid'
    CONSTRAINT bee_ecosystem_partner_collaboration_type_check
    CHECK (collaboration_type IN ('paid','content_exchange','mixed')),
  exchange_value_amount numeric(14,2)
    CONSTRAINT bee_ecosystem_partner_exchange_value_check
    CHECK (exchange_value_amount IS NULL OR exchange_value_amount>=0),
  exchange_terms text NOT NULL DEFAULT '',
  deliverables text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'discovered'
    CHECK (status IN ('discovered','under_review','internally_verified','impact_documented','ready_to_sell')),
  evidence_reference text NOT NULL DEFAULT '',
  quote_reference text NOT NULL DEFAULT '',
  budget_amount numeric(14,2),
  budget_currency text NOT NULL DEFAULT 'EUR',
  availability_note text NOT NULL DEFAULT '',
  safety_note text NOT NULL DEFAULT '',
  production_validated boolean NOT NULL DEFAULT false,
  impact_note text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL REFERENCES bee_community_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bee_ecosystem_partners ADD COLUMN IF NOT EXISTS contact_name text NOT NULL DEFAULT '';
ALTER TABLE bee_ecosystem_partners ADD COLUMN IF NOT EXISTS contact_email text NOT NULL DEFAULT '';
ALTER TABLE bee_ecosystem_partners ADD COLUMN IF NOT EXISTS contact_phone text NOT NULL DEFAULT '';
ALTER TABLE bee_ecosystem_partners ADD COLUMN IF NOT EXISTS website text NOT NULL DEFAULT '';
ALTER TABLE bee_ecosystem_partners ADD COLUMN IF NOT EXISTS collaboration_type text NOT NULL DEFAULT 'paid';
ALTER TABLE bee_ecosystem_partners ADD COLUMN IF NOT EXISTS exchange_value_amount numeric(14,2);
ALTER TABLE bee_ecosystem_partners ADD COLUMN IF NOT EXISTS exchange_terms text NOT NULL DEFAULT '';
ALTER TABLE bee_ecosystem_partners ADD COLUMN IF NOT EXISTS deliverables text NOT NULL DEFAULT '';
DO $constraints$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bee_ecosystem_partner_collaboration_type_check') THEN
    ALTER TABLE bee_ecosystem_partners
      ADD CONSTRAINT bee_ecosystem_partner_collaboration_type_check
      CHECK (collaboration_type IN ('paid','content_exchange','mixed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bee_ecosystem_partner_exchange_value_check') THEN
    ALTER TABLE bee_ecosystem_partners
      ADD CONSTRAINT bee_ecosystem_partner_exchange_value_check
      CHECK (exchange_value_amount IS NULL OR exchange_value_amount>=0);
  END IF;
END $constraints$;

CREATE TABLE IF NOT EXISTS bee_ecosystem_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('studio','demo')),
  entity_type text NOT NULL CHECK (entity_type IN ('creator','destination','asset','kit','partner')),
  entity_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('talent','content','collection','project','company','opportunity','production','journey','booking')),
  target_id text NOT NULL,
  label text NOT NULL DEFAULT '',
  created_by uuid NOT NULL REFERENCES bee_community_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(scope,entity_type,entity_id,target_type,target_id)
);

CREATE TABLE IF NOT EXISTS bee_ecosystem_journey_assets (
  journey_id text NOT NULL,
  kit_id uuid NOT NULL REFERENCES bee_ecosystem_kits(id),
  asset_id uuid NOT NULL REFERENCES bee_ecosystem_assets(id),
  public_media_id uuid NOT NULL REFERENCES bee_ecosystem_media(id),
  position integer NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(journey_id,asset_id)
);

CREATE TABLE IF NOT EXISTS bee_ecosystem_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('studio','demo')),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  actor_id uuid NOT NULL REFERENCES bee_community_users(id),
  action text NOT NULL,
  snapshot jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bee_ecosystem_creator_scope_status ON bee_ecosystem_creators(scope,status);
CREATE INDEX IF NOT EXISTS bee_ecosystem_asset_kit ON bee_ecosystem_assets(kit_id,slot,slot_index);
CREATE INDEX IF NOT EXISTS bee_ecosystem_partner_destination ON bee_ecosystem_partners(destination_id,status);
CREATE INDEX IF NOT EXISTS bee_ecosystem_link_target ON bee_ecosystem_links(scope,target_type,target_id);
CREATE INDEX IF NOT EXISTS bee_ecosystem_event_entity ON bee_ecosystem_events(scope,entity_type,entity_id,created_at DESC);

DO $grants$
DECLARE app_role text := current_database() || '_app';
BEGIN
  IF current_database() IN ('bee_site','bee_site_qa') THEN
    EXECUTE format(
      'GRANT SELECT,INSERT,UPDATE,DELETE ON bee_ecosystem_creators,bee_ecosystem_invitations,bee_ecosystem_destinations,bee_ecosystem_kits,bee_ecosystem_assets,bee_ecosystem_media,bee_ecosystem_media_chunks,bee_ecosystem_partners,bee_ecosystem_links,bee_ecosystem_journey_assets,bee_ecosystem_events TO %I',
      app_role
    );
  END IF;
END $grants$;

COMMIT;
