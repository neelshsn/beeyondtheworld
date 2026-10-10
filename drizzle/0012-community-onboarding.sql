BEGIN;
CREATE TABLE IF NOT EXISTS bee_community_invitations (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES bee_community_projects(id),
 email text NOT NULL, name text NOT NULL, organization text NOT NULL,
 role text NOT NULL CHECK(role IN ('bee','brand','production','art_director','stylist','photographer','filmmaker','beauty','editor','ngo','expert','model')),
 token_hash text NOT NULL UNIQUE, created_by uuid NOT NULL REFERENCES bee_community_users(id),
 expires_at timestamptz NOT NULL, accepted_at timestamptz, revoked_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bee_community_invitation_project_idx ON bee_community_invitations(project_id,created_at DESC);
DO $grants$
BEGIN
 IF current_database() IN ('bee_site','bee_site_qa') THEN
  EXECUTE format('GRANT SELECT,INSERT,UPDATE ON bee_community_invitations TO %I',current_database()||'_app');
  EXECUTE format('GRANT INSERT ON bee_community_projects,bee_community_members,bee_community_users TO %I',current_database()||'_app');
 END IF;
END $grants$;
COMMIT;
