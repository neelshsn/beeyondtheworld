import { pages, pageKind, roleKey, utilityPages } from '@/lib/community/horizon';
import { journeyArtwork } from '@/lib/community/artwork';
import { roleNames, type Project, type Workspace } from '@/lib/community/types';

const completedStatuses = new Set(['approved', 'expert_validated']);

export type DashboardStage = {
  id: string;
  title: string;
  total: number;
  started: number;
  documented: number;
  completed: number;
  firstPageId: string;
};

const stagePresentation: Record<string, { id: string; title: string }> = {
  Accueil: { id: 'welcome', title: 'Welcome' },
  Accès: { id: 'access', title: 'Access' },
  Brief: { id: 'brief', title: 'Brief' },
  Confiance: { id: 'trust', title: 'Trust' },
  'Création Bee': { id: 'creative', title: 'Creative' },
  'Scouting · Bee → Flower': { id: 'scouting', title: 'Scouting' },
  Préparation: { id: 'preparation', title: 'Preparation' },
  'Flower · Production': { id: 'production', title: 'Production' },
  Postproduction: { id: 'postproduction', title: 'Postproduction' },
  Livraison: { id: 'delivery', title: 'Delivery' },
  'Impact · Bee': { id: 'impact-planning', title: 'Impact planning' },
  'Impact · Flower': { id: 'on-the-ground', title: 'On the ground' },
  'Impact · Honey': { id: 'impact-review', title: 'Impact review' },
  'Bilan · Honey': { id: 'report', title: 'Report' },
  'Creative Studio · DA': { id: 'creative-proposal', title: 'Creative proposal' },
};

export function projectRoleLabel(project: Pick<Project, 'role'>) {
  return roleNames[project.role];
}

function calendarDate(value: string | null | undefined) {
  if (typeof value !== 'string') return null;
  const day = value.split('T')[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== day) return null;
  return date;
}

export function projectDate(
  startsOn: string | null | undefined,
  endsOn: string | null | undefined
) {
  const format = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const start = calendarDate(startsOn);
  const end = calendarDate(endsOn);
  if (start && end) return `${format.format(start)} — ${format.format(end)}`;
  if (start) return format.format(start);
  if (end) return format.format(end);
  return '';
}

export function dashboardProjectArtwork(project: Pick<Project, 'id' | 'territory'> | undefined) {
  if (project?.territory.toLowerCase().includes('namib')) return '/assets/community/namibia.webp';
  return journeyArtwork(project);
}

export function visibleDashboardStages(workspace: Workspace): DashboardStage[] {
  const role = roleKey(workspace.project.role);
  const visible = pages.filter(
    (page) => !utilityPages.includes(page.id) && (role === 'bee' || Boolean(page.roles[role]))
  );
  const stages = new Map<string, DashboardStage>();

  for (const page of visible) {
    const presentation = stagePresentation[page.phase] || {
      id: page.phase
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      title: page.phase,
    };
    const stage = stages.get(page.phase) || {
      ...presentation,
      total: 0,
      started: 0,
      documented: 0,
      completed: 0,
      firstPageId: page.id,
    };
    const records = workspace.records.filter((record) => record.kind === pageKind(page.id));
    stage.total += 1;
    if (records.length) stage.started += 1;
    if (records.some((record) => completedStatuses.has(record.status))) {
      stage.documented += 1;
      stage.completed += 1;
    }
    stages.set(page.phase, stage);
  }

  return [...stages.values()];
}

export function dashboardProgress(stages: DashboardStage[]) {
  const total = stages.reduce((sum, stage) => sum + stage.total, 0);
  const started = stages.reduce((sum, stage) => sum + stage.started, 0);
  const documented = stages.reduce((sum, stage) => sum + stage.documented, 0);
  return { total, started, documented };
}
