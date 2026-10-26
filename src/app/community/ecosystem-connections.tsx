'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Feather, MapPin, Layers } from 'lucide-react';
type Connections = {
  applications: unknown[];
  kits: { id: string }[];
  partners: { id: string; status: string }[];
  readiness: Record<string, { approved: number; required: number }>;
};
export function EcosystemConnections({ project, demo }: { project: string; demo: boolean }) {
  const [data, setData] = useState<Connections | null>(null);
  const base = `/dashboard/ecosystem?scope=${demo ? 'demo' : 'studio'}&project=${project}`;
  useEffect(() => {
    const abort = new AbortController();
    setData(null);
    fetch(
      `/api/community/ecosystem?scope=${demo ? 'demo' : 'studio'}&project=${project}&detail=1`,
      { cache: 'no-store', signal: abort.signal }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {});
    return () => abort.abort();
  }, [project, demo]);
  if (!data) return null;
  const reviewed = data.partners.filter((p) =>
    ['internally_verified', 'impact_documented', 'ready_to_sell'].includes(p.status)
  ).length;
  return (
    <section
      className="source-panel"
      aria-label="Connected local ecosystem"
      style={{ margin: '24px 0' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 20,
          alignItems: 'start',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span className="eyebrow">LOCAL EYES · SHARED JOURNEY</span>
          <h2 style={{ fontSize: 28, margin: '10px 0' }}>Your local ecosystem.</h2>
          <p>Visual Poets, destination kits and production partners linked to this journey.</p>
        </div>
        <a className="text-link" href={base + '&tab=studio'}>
          Open the ecosystem <ArrowUpRight size={16} />
        </a>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))',
          gap: 16,
          marginTop: 22,
        }}
      >
        {[
          { tab: 'studio', icon: Feather, label: 'Visual Poets', value: data.applications.length },
          { tab: 'kits', icon: Layers, label: 'Destination kits', value: data.kits.length },
          { tab: 'partners', icon: MapPin, label: 'Local partners', value: data.partners.length },
        ].map((x) => (
          <a
            key={x.tab}
            href={base + '&tab=' + x.tab}
            style={{
              border: '1px solid var(--line)',
              padding: 18,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <x.icon size={18} aria-hidden />
            <strong style={{ display: 'block', fontSize: 26, marginTop: 10 }}>{x.value}</strong>
            <span style={{ fontSize: 13 }}>{x.label}</span>
          </a>
        ))}
      </div>
      {reviewed > 0 && (
        <p style={{ fontSize: 12, marginTop: 18 }}>
          {reviewed} partner{reviewed === 1 ? '' : 's'} with an internal review. Production approval
          remains separate.
        </p>
      )}
    </section>
  );
}
