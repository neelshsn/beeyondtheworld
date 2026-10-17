-- Add the three creative poles without changing existing identities or permissions.
BEGIN;
ALTER TABLE bee_community_members DROP CONSTRAINT IF EXISTS bee_community_members_role_check;
ALTER TABLE bee_community_members ADD CONSTRAINT bee_community_members_role_check
CHECK(role IN ('bee','brand','production','art_director','stylist','photographer','filmmaker','beauty','editor','ngo','expert','model','set','sound','agency'));
ALTER TABLE bee_community_invitations DROP CONSTRAINT IF EXISTS bee_community_invitations_role_check;
ALTER TABLE bee_community_invitations ADD CONSTRAINT bee_community_invitations_role_check
CHECK(role IN ('bee','brand','production','art_director','stylist','photographer','filmmaker','beauty','editor','ngo','expert','model','set','sound','agency'));
CREATE UNIQUE INDEX IF NOT EXISTS bee_community_one_da_proposal ON bee_community_records(project_id) WHERE kind='da:proposal';
COMMIT;
