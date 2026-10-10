-- Add the approved Talent role. Preserve all existing accounts and assignments.
BEGIN;
ALTER TABLE bee_community_users ADD COLUMN IF NOT EXISTS profile jsonb NOT NULL DEFAULT '{}';
-- Profile editing requires only these columns; authentication fields stay read only.
DO $profile_grant$
BEGIN
  IF current_database() IN ('bee_site','bee_site_qa') THEN
    EXECUTE format('GRANT UPDATE (name,profile) ON bee_community_users TO %I',current_database()||'_app');
  END IF;
END $profile_grant$;
ALTER TABLE bee_community_members DROP CONSTRAINT IF EXISTS bee_community_members_role_check;
ALTER TABLE bee_community_members ADD CONSTRAINT bee_community_members_role_check
CHECK(role IN ('bee','brand','production','art_director','stylist','photographer','filmmaker','beauty','editor','ngo','expert','model'));
COMMIT;
