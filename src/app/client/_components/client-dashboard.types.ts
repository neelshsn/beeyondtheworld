export type DashboardCardKind =
  | 'journey'
  | 'campaign'
  | 'all-journeys'
  | 'all-campaigns'
  | 'concept'
  | 'concierge'
  | 'contact'
  | 'home'
  | 'logout'
  | 'profile'
  | 'favorites';

export type DashboardCardSize = 'xs' | 'sm' | 'md' | 'lg';

export interface DashboardMedia {
  kind: 'image' | 'video';
  src: string;
  alt: string;
  poster?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
}

export interface DashboardMetaItem {
  label: string;
  value: string;
}

export interface DashboardAction {
  label: string;
  href?: string;
  intent?: 'navigate' | 'logout' | 'contact' | 'modal';
  tone?: 'primary' | 'secondary' | 'ghost';
}

export interface DashboardCardData {
  id: string;
  kind: DashboardCardKind;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  description?: string;
  hint?: string;
  href?: string;
  slug?: string;
  size: DashboardCardSize;
  tone?: 'dark' | 'light';
  accent?: 'onyx' | 'pearl' | 'orchid' | 'honey' | 'iris' | 'sand';
  accentGradient?: string;
  media?: DashboardMedia;
  gallery?: DashboardMedia[];
  meta?: DashboardMetaItem[];
  badges?: string[];
  actions?: DashboardAction[];
  payload?: Record<string, unknown>;
}

export interface DashboardGridSlot {
  id: string;
  card: DashboardCardData;
  layoutClass: string;
  expandedClass?: string;
  collapsedClass?: string;
}
