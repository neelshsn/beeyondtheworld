export const roles = [
  'bee',
  'brand',
  'production',
  'art_director',
  'stylist',
  'photographer',
  'filmmaker',
  'beauty',
  'editor',
  'ngo',
  'expert',
  'model',
  'set',
  'sound',
  'agency',
] as const;
export type Role = (typeof roles)[number];
export const roleNames: Record<Role, string> = {
  bee: 'Bee Core',
  brand: 'Brand',
  production: 'Production director',
  art_director: 'Artistic director',
  stylist: 'Stylist',
  photographer: 'Photographer',
  filmmaker: 'Filmmaker',
  beauty: 'Makeup & hair',
  editor: 'Editor / post-production',
  ngo: 'NGO / local partner',
  expert: 'Expert / validator',
  model: 'Talent',
  set: 'Set designer',
  sound: 'Sound producer',
  agency: 'Casting agency',
};
export type User = {
  id: string;
  email: string;
  name: string;
  organization: string;
  is_test: boolean;
  profile?: RecordData;
};
export type Project = {
  id: string;
  title: string;
  territory: string;
  season: string;
  starts_on: string;
  ends_on: string;
  is_demo: boolean;
  role: Role;
};
export type RecordData = Record<string, string | number | boolean>;
export type CommunityRecord = {
  id: string;
  project_id: string;
  kind: string;
  title: string;
  status: string;
  data: RecordData;
  organization: string;
  created_by: string;
  version: number;
  created_at: string;
  updated_at: string;
  files?: { id: string; name: string; mime: string; size: number; sha256: string }[];
};
export type Member = { id: string; name: string; organization: string; role: Role };
export type Event = {
  id: string;
  record_id: string;
  actor: string;
  action: string;
  previous_state: string;
  new_state: string;
  comment: string;
  created_at: string;
};
export type Workspace = {
  testRoles?: Role[];
  user: User;
  projects: Project[];
  project: Project;
  records: CommunityRecord[];
  members: Member[];
  events: Event[];
};
export type Field = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'date' | 'url' | 'select' | 'record';
  options?: string[];
  required?: boolean;
  unit?: string;
  linkKind?: string;
};
export type Kind = {
  label: string;
  group: 'bee' | 'flower' | 'honey';
  roles: Role[];
  read: Role[];
  fields: Field[];
  initial: string;
  transitions: Record<string, { to: string; roles: Role[] }[]>;
};
