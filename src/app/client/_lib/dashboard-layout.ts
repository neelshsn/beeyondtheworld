export type DashboardSlotId =
  | 'slot-all-journeys'
  | 'slot-campaign-vault'
  | 'slot-concept'
  | 'slot-home'
  | 'slot-journey-hero'
  | 'slot-campaign-spotlight'
  | 'slot-concierge'
  | 'slot-journey-spotlight'
  | 'slot-contact'
  | 'slot-logout';

type Breakpoint = 'lg' | 'xl' | '2xl';

interface LayoutProps {
  colStart?: number;
  colSpan?: number;
  rowStart?: number;
  rowSpan?: number;
}

type ParsedLayout = Partial<Record<Breakpoint, LayoutProps>>;

interface Placement {
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
}

type PlacementMap = Partial<Record<DashboardSlotId, Placement>>;

const GRID_COLUMNS: Record<Breakpoint, number> = {
  lg: 2,
  xl: 4,
  '2xl': 4,
};

export const SLOT_LAYOUT: Record<DashboardSlotId, string> = {
  'slot-all-journeys':
    'lg:col-span-1 lg:row-span-1 xl:col-start-1 xl:col-span-1 xl:row-start-1 xl:row-span-2 2xl:col-start-1 2xl:col-span-1 2xl:row-start-1 2xl:row-span-2',
  'slot-campaign-vault':
    'lg:col-span-1 lg:row-span-1 xl:col-start-4 xl:col-span-1 xl:row-start-2 xl:row-span-1 2xl:col-start-4 2xl:col-span-1 2xl:row-start-2 2xl:row-span-1',
  'slot-concept':
    'lg:col-span-1 lg:row-span-1 xl:col-start-2 xl:col-span-1 xl:row-start-4 xl:row-span-1 2xl:col-start-2 2xl:col-span-1 2xl:row-start-4 2xl:row-span-1',
  'slot-home':
    'lg:col-span-1 lg:row-span-1 xl:col-start-4 xl:col-span-1 xl:row-start-1 xl:row-span-1 2xl:col-start-4 2xl:col-span-1 2xl:row-start-1 2xl:row-span-1',
  'slot-journey-hero':
    'lg:col-span-2 lg:row-span-2 xl:col-start-2 xl:col-span-2 xl:row-start-1 xl:row-span-2 2xl:col-start-2 2xl:col-span-2 2xl:row-start-1 2xl:row-span-2',
  'slot-campaign-spotlight':
    'lg:col-span-1 lg:row-span-2 xl:col-start-1 xl:col-span-1 xl:row-start-3 xl:row-span-2 2xl:col-start-1 2xl:col-span-1 2xl:row-start-3 2xl:row-span-2',
  'slot-concierge':
    'lg:col-span-1 lg:row-span-1 xl:col-start-2 xl:col-span-1 xl:row-start-3 xl:row-span-1 2xl:col-start-2 2xl:col-span-1 2xl:row-start-3 2xl:row-span-1',
  'slot-journey-spotlight':
    'lg:col-span-1 lg:row-span-2 xl:col-start-3 xl:col-span-1 xl:row-start-3 xl:row-span-2 2xl:col-start-3 2xl:col-span-1 2xl:row-start-3 2xl:row-span-2',
  'slot-contact':
    'lg:col-span-1 lg:row-span-1 xl:col-start-4 xl:col-span-1 xl:row-start-3 xl:row-span-1 2xl:col-start-4 2xl:col-span-1 2xl:row-start-3 2xl:row-span-1',
  'slot-logout':
    'lg:col-span-1 lg:row-span-1 xl:col-start-4 xl:col-span-1 xl:row-start-4 xl:row-span-1 2xl:col-start-4 2xl:col-span-1 2xl:row-start-4 2xl:row-span-1',
};

export const SLOT_EXPANDED: Record<DashboardSlotId, string> = {
  'slot-journey-hero':
    'lg:col-span-2 lg:row-span-3 xl:col-span-3 xl:row-span-4 2xl:col-span-3 2xl:row-span-4',
  'slot-campaign-spotlight':
    'lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-3 2xl:col-span-2 2xl:row-span-3',
  'slot-journey-spotlight':
    'lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-3 2xl:col-span-2 2xl:row-span-3',
  'slot-all-journeys':
    'lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-2 2xl:col-span-2 2xl:row-span-2',
  'slot-campaign-vault':
    'lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-2 2xl:col-span-2 2xl:row-span-2',
  'slot-concept':
    'lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-2 2xl:col-span-2 2xl:row-span-2',
  'slot-home':
    'lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-2 2xl:col-span-2 2xl:row-span-2',
  'slot-concierge':
    'lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-2 2xl:col-span-2 2xl:row-span-2',
  'slot-contact':
    'lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-2 2xl:col-span-2 2xl:row-span-2',
  'slot-logout':
    'lg:col-span-2 lg:row-span-2 xl:col-span-2 xl:row-span-2 2xl:col-span-2 2xl:row-span-2',
};

export const SLOT_COLLAPSED: Record<DashboardSlotId, string> = {
  'slot-journey-hero':
    'lg:col-span-1 lg:row-span-1 xl:col-span-1 xl:row-span-1 2xl:col-span-1 2xl:row-span-1',
  'slot-campaign-spotlight':
    'lg:col-span-1 lg:row-span-1 xl:col-span-1 xl:row-span-1 2xl:col-span-1 2xl:row-span-1',
  'slot-journey-spotlight':
    'lg:col-span-1 lg:row-span-1 xl:col-span-1 xl:row-span-1 2xl:col-span-1 2xl:row-span-1',
  'slot-all-journeys':
    'lg:col-span-1 lg:row-span-1 xl:col-span-1 xl:row-span-1 2xl:col-span-1 2xl:row-span-1',
  'slot-campaign-vault':
    'lg:col-span-1 lg:row-span-1 xl:col-span-1 xl:row-span-1 2xl:col-span-1 2xl:row-span-1',
  'slot-concept':
    'lg:col-span-1 lg:row-span-1 xl:col-span-1 xl:row-span-1 2xl:col-span-1 2xl:row-span-1',
  'slot-home':
    'lg:col-span-1 lg:row-span-1 xl:col-span-1 xl:row-span-1 2xl:col-span-1 2xl:row-span-1',
  'slot-concierge':
    'lg:col-span-1 lg:row-span-1 xl:col-span-1 xl:row-span-1 2xl:col-span-1 2xl:row-span-1',
  'slot-contact':
    'lg:col-span-1 lg:row-span-1 xl:col-span-1 xl:row-span-1 2xl:col-span-1 2xl:row-span-1',
  'slot-logout':
    'lg:col-span-1 lg:row-span-1 xl:col-span-1 xl:row-span-1 2xl:col-span-1 2xl:row-span-1',
};

type SlotTemplate = Record<DashboardSlotId, string>;

export const BASE_TEMPLATE: SlotTemplate = { ...SLOT_LAYOUT };

const BASE_LAYOUT_PARSED = parseLayoutMap(SLOT_LAYOUT);
const EXPANDED_LAYOUT_PARSED = parseLayoutMap(SLOT_EXPANDED);
const COLLAPSED_LAYOUT_PARSED = parseLayoutMap(SLOT_COLLAPSED);

const SLOT_ORDER: DashboardSlotId[] = computeSlotOrder();

export const HOVER_TEMPLATES: Record<DashboardSlotId, SlotTemplate> = buildHoverTemplates();

function buildHoverTemplates(): Record<DashboardSlotId, SlotTemplate> {
  const templates: Partial<Record<DashboardSlotId, SlotTemplate>> = {};
  for (const hoveredId of SLOT_ORDER) {
    templates[hoveredId] = buildTemplateForHover(hoveredId);
  }
  return templates as Record<DashboardSlotId, SlotTemplate>;
}

function buildTemplateForHover(hoveredId: DashboardSlotId): SlotTemplate {
  const placementsByBreakpoint: Record<Breakpoint, PlacementMap> = {
    lg: {},
    xl: computeBreakpointPlacements('xl', hoveredId),
    '2xl': computeBreakpointPlacements('2xl', hoveredId),
  };

  const entries = SLOT_ORDER.map((slotId) => [
    slotId,
    buildClassString(slotId, hoveredId, placementsByBreakpoint),
  ]);
  return Object.fromEntries(entries) as SlotTemplate;
}

function buildClassString(
  slotId: DashboardSlotId,
  hoveredId: DashboardSlotId,
  placementsByBreakpoint: Record<Breakpoint, PlacementMap>
): string {
  const tokens: string[] = [];
  const isHovered = slotId === hoveredId;

  const baseLayout = BASE_LAYOUT_PARSED[slotId];
  const expanded = EXPANDED_LAYOUT_PARSED[slotId];
  const collapsed = COLLAPSED_LAYOUT_PARSED[slotId];

  const lgSource = isHovered ? (expanded?.lg ?? baseLayout?.lg) : (collapsed?.lg ?? baseLayout?.lg);
  if (lgSource?.colSpan) {
    tokens.push('lg:col-span-' + lgSource.colSpan);
  }
  if (lgSource?.rowSpan) {
    tokens.push('lg:row-span-' + lgSource.rowSpan);
  }

  for (const breakpoint of ['xl', '2xl'] as const) {
    const placement = placementsByBreakpoint[breakpoint][slotId] ?? baseLayout?.[breakpoint];
    if (!placement) {
      continue;
    }
    tokens.push(breakpoint + ':col-start-' + placement.colStart);
    tokens.push(breakpoint + ':col-span-' + placement.colSpan);
    tokens.push(breakpoint + ':row-start-' + placement.rowStart);
    tokens.push(breakpoint + ':row-span-' + placement.rowSpan);
  }

  return tokens.join(' ');
}

// Reflow cards for the hovered state so spans never overlap while preserving column count.
function computeBreakpointPlacements(
  breakpoint: Exclude<Breakpoint, 'lg'>,
  hoveredId: DashboardSlotId
): PlacementMap {
  const columns = GRID_COLUMNS[breakpoint];
  const placements: PlacementMap = {};
  const occupied = new Set<string>();

  const hoveredBase = BASE_LAYOUT_PARSED[hoveredId]?.[breakpoint];
  if (!hoveredBase) {
    return {} as Record<DashboardSlotId, Placement>;
  }

  const hoveredDims = normalizeDims(
    EXPANDED_LAYOUT_PARSED[hoveredId]?.[breakpoint],
    hoveredBase,
    columns
  );
  placeSlot(hoveredId, hoveredDims, hoveredBase, columns, occupied, placements);

  for (const slotId of SLOT_ORDER) {
    if (slotId === hoveredId) {
      continue;
    }

    const base = BASE_LAYOUT_PARSED[slotId]?.[breakpoint];
    if (!base) {
      continue;
    }

    const dims = normalizeDims(COLLAPSED_LAYOUT_PARSED[slotId]?.[breakpoint], base, columns);
    placeSlot(slotId, dims, base, columns, occupied, placements);
  }

  return placements;
}

function placeSlot(
  slotId: DashboardSlotId,
  dims: { colSpan: number; rowSpan: number },
  preferred: LayoutProps,
  columns: number,
  occupied: Set<string>,
  placements: PlacementMap
): void {
  let row = Math.max(1, preferred?.rowStart ?? 1);
  let col = clampColumnStart(preferred?.colStart ?? 1, dims.colSpan, columns);
  let attempts = 0;

  while (!canPlace(row, col, dims.rowSpan, dims.colSpan, columns, occupied) && attempts < 200) {
    col += 1;
    if (col + dims.colSpan - 1 > columns) {
      col = 1;
      row += 1;
    }
    attempts += 1;
  }

  markCells(row, col, dims.rowSpan, dims.colSpan, occupied);

  placements[slotId] = {
    colStart: col,
    colSpan: dims.colSpan,
    rowStart: row,
    rowSpan: dims.rowSpan,
  };
}

function canPlace(
  rowStart: number,
  colStart: number,
  rowSpan: number,
  colSpan: number,
  columns: number,
  occupied: Set<string>
): boolean {
  if (colStart < 1 || colStart + colSpan - 1 > columns) {
    return false;
  }

  for (let row = rowStart; row < rowStart + rowSpan; row += 1) {
    for (let col = colStart; col < colStart + colSpan; col += 1) {
      if (occupied.has(cellKey(row, col))) {
        return false;
      }
    }
  }

  return true;
}

function markCells(
  rowStart: number,
  colStart: number,
  rowSpan: number,
  colSpan: number,
  occupied: Set<string>
): void {
  for (let row = rowStart; row < rowStart + rowSpan; row += 1) {
    for (let col = colStart; col < colStart + colSpan; col += 1) {
      occupied.add(cellKey(row, col));
    }
  }
}

function normalizeDims(
  source: LayoutProps | undefined,
  fallback: LayoutProps | undefined,
  columns: number
): { colSpan: number; rowSpan: number } {
  const colSpan = Math.max(1, Math.min(columns, source?.colSpan ?? fallback?.colSpan ?? 1));
  const rowSpan = Math.max(1, source?.rowSpan ?? fallback?.rowSpan ?? 1);

  return { colSpan, rowSpan };
}

function parseLayoutMap(
  map: Record<DashboardSlotId, string>
): Record<DashboardSlotId, ParsedLayout> {
  return Object.fromEntries(
    Object.entries(map).map(([slotId, value]) => [slotId, parseLayoutString(value)])
  ) as Record<DashboardSlotId, ParsedLayout>;
}

function parseLayoutString(value: string): ParsedLayout {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  const parsed: ParsedLayout = {};

  for (const token of tokens) {
    const match = token.match(/^(?:(lg|xl|2xl):)?(col|row)-(start|span)-(\d+)$/);
    if (!match) {
      continue;
    }

    const [, prefix = 'lg', axis, kind, rawValue] = match;
    if (prefix !== 'lg' && prefix !== 'xl' && prefix !== '2xl') {
      continue;
    }

    const breakpoint = prefix as Breakpoint;
    const numeric = Number.parseInt(rawValue, 10);
    if (Number.isNaN(numeric)) {
      continue;
    }

    const data = parsed[breakpoint] ?? (parsed[breakpoint] = {});
    if (axis === 'col' && kind === 'start') {
      data.colStart = numeric;
    } else if (axis === 'col' && kind === 'span') {
      data.colSpan = numeric;
    } else if (axis === 'row' && kind === 'start') {
      data.rowStart = numeric;
    } else if (axis === 'row' && kind === 'span') {
      data.rowSpan = numeric;
    }
  }

  return parsed;
}

function computeSlotOrder(): DashboardSlotId[] {
  return Object.entries(BASE_LAYOUT_PARSED)
    .map(([slotId, layout]) => {
      const xl = layout.xl ?? {};
      return {
        slotId: slotId as DashboardSlotId,
        rowStart: xl.rowStart ?? Number.MAX_SAFE_INTEGER,
        colStart: xl.colStart ?? Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((a, b) => {
      if (a.rowStart !== b.rowStart) {
        return a.rowStart - b.rowStart;
      }
      return a.colStart - b.colStart;
    })
    .map((entry) => entry.slotId);
}

function clampColumnStart(colStart: number, colSpan: number, columns: number): number {
  const maxStart = Math.max(1, columns - colSpan + 1);
  return Math.min(Math.max(1, colStart), maxStart);
}

function cellKey(row: number, col: number): string {
  return row + ':' + col;
}
