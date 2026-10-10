import 'server-only';
import { sqlClient } from '../db/client';
export { sqlClient } from '../db/client';
import { cookies } from 'next/headers';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { canRead } from './model';
import { privateProductionFields } from './horizon';
import type { CommunityRecord, Project, User, Workspace, Member, Event } from './types';
import { DEMO_ROLE_COOKIE, readDemoRole } from './demo-role';
const scrypt = promisify(scryptCallback);
export const COOKIE = 'bee-community-session';
export const digest = (s: string) => createHash('sha256').update(s).digest('hex');
export async function verify(password: string, stored: string) {
  const [salt, hex] = stored.split(':');
  if (!salt || !hex || hex.length !== 128) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hex, 'hex');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const rows = await sqlClient().query(
    `SELECT u.id,u.email,u.name,u.organization,u.is_test,u.profile FROM bee_community_sessions s JOIN bee_community_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND NOT u.disabled`,
    [digest(token)]
  );
  return (rows[0] as User) || null;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  await sqlClient().query(
    "INSERT INTO bee_community_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '12 hours')",
    [digest(token), userId]
  );
  return token;
}
export async function workspace(projectId?: string): Promise<Workspace | null> {
  let user = await currentUser();
  if (!user) return null;
  const sql = sqlClient();
  const projects = (await sql.query(
    'SELECT p.*,m.role FROM bee_community_projects p JOIN bee_community_members m ON m.project_id=p.id WHERE m.user_id=$1 ORDER BY p.created_at,p.id',
    [user.id]
  )) as Project[];
  let project = projectId ? projects.find((p) => p.id === projectId) : projects[0];
  if (!project) return null;
  let testRoles: Project['role'][] = [];
  if (user.is_test && project.is_demo) {
    const candidates = await sql.query(
      `SELECT u.id,u.email,u.name,u.organization,u.is_test,u.profile,m.role
      FROM bee_community_members m JOIN bee_community_users u ON u.id=m.user_id
      WHERE m.project_id=$1 AND u.is_test AND NOT u.disabled ORDER BY u.id`,
      [project.id]
    );
    testRoles = [...new Set(candidates.map((c) => c.role as Project['role']))];
    const jar = await cookies();
    const role = readDemoRole(jar.get(DEMO_ROLE_COOKIE)?.value, jar.get(COOKIE)?.value, project.id);
    const target = role && candidates.find((c) => c.role === role);
    if (target) {
      user = {
        id: target.id,
        email: target.email,
        name: target.name,
        organization: target.organization,
        is_test: true,
        profile: target.profile,
      };
      project = { ...project, role: target.role };
    }
  }
  const [allRecords, files, allEvents, allMembers] = await Promise.all([
    sql.query<CommunityRecord>(
      'SELECT * FROM bee_community_records WHERE project_id=$1 ORDER BY created_at,id',
      [project.id]
    ),
    sql.query(
      'SELECT f.id,f.record_id,f.name,f.mime,f.size,f.sha256 FROM bee_community_files f JOIN bee_community_records r ON r.id=f.record_id WHERE r.project_id=$1',
      [project.id]
    ),
    sql.query<Event>(
      'SELECT e.id,e.record_id,u.name as actor,e.action,e.previous_state,e.new_state,e.comment,e.created_at FROM bee_community_events e JOIN bee_community_users u ON u.id=e.actor_id WHERE e.project_id=$1 ORDER BY e.created_at DESC LIMIT 200',
      [project.id]
    ),
    sql.query<Member>(
      'SELECT u.id,u.name,u.organization,m.role FROM bee_community_members m JOIN bee_community_users u ON u.id=m.user_id WHERE m.project_id=$1 AND NOT u.disabled ORDER BY u.name',
      [project.id]
    ),
  ]);
  const records = allRecords.filter((r) => canRead(project.role, r, user));
  const filesByRecord = new Map<string, CommunityRecord['files']>();
  for (const f of files) {
    const list = filesByRecord.get(f.record_id) || [];
    list.push(f as NonNullable<CommunityRecord['files']>[number]);
    filesByRecord.set(f.record_id, list);
  }
  for (const r of records) {
    if (project.role === 'production')
      for (const key of privateProductionFields[r.kind] || []) delete r.data[key];
    r.files = filesByRecord.get(r.id) || [];
  }
  const ids = new Set(records.map((r) => r.id));
  const events = allEvents.filter((e) => ids.has(e.record_id));
  let members = allMembers;
  if (project.role === 'ngo' || project.role === 'expert')
    members = members.filter((m) => m.organization === user.organization || m.role === 'bee');
  return { user, projects, project, records, members, events, testRoles };
}
