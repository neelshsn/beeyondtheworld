'use client';
import { useEffect, useState } from 'react';
type Linked = {
  internal: boolean;
  collections: {
    id: string;
    title: string;
    status: string;
    intention: string;
    contents: {
      id: string;
      title: string;
      credit: string;
      medium: string;
      provenance: string;
      chapter: string;
    }[];
    activations: { title: string; status: string }[];
  }[];
};
export function CreativeConnections({ project, demo }: { project: string; demo: boolean }) {
  const [data, setData] = useState<Linked | null>(null);
  useEffect(() => {
    let active = true;
    fetch('/api/community/creative?project=' + project, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [project]);
  if (!data || (!data.internal && !data.collections.length)) return null;
  return (
    <details style={{ border: '1px solid var(--line)', padding: '16px 22px', marginBottom: 24 }}>
      <summary style={{ cursor: 'pointer', color: 'var(--gold)' }}>
        Creative CRM ·{' '}
        {data.collections.length
          ? `${data.collections.length} connected portfolio${data.collections.length > 1 ? 's' : ''}`
          : 'Connect the local stories'}
      </summary>
      {data.collections.map((c) => (
        <section key={c.id} style={{ padding: '18px 0' }}>
          <strong>{c.title}</strong> · {c.status}
          <p>{c.intention}</p>
          {c.contents.map((x) => (
            <p key={x.id} style={{ fontSize: 13 }}>
              {x.title} · {x.medium} · {x.credit} · {x.provenance}
              {x.chapter ? ' · Chapter: ' + x.chapter : ''}
            </p>
          ))}
          {c.activations.map((x, i) => (
            <p key={i}>
              {x.title} · Booking: {x.status}
            </p>
          ))}
          {data.internal && (
            <a
              href={`/community/creative?scope=${demo ? 'demo' : 'studio'}&tab=collection&item=${c.id}`}
              style={{ color: 'var(--gold)' }}
            >
              Open selection & rights →
            </a>
          )}
        </section>
      ))}
      {data.internal && (
        <a
          href={'/community/creative?scope=' + (demo ? 'demo' : 'studio')}
          style={{ display: 'inline-block', marginTop: 18, color: 'var(--gold)' }}
        >
          Open Creative Studio →
        </a>
      )}
    </details>
  );
}
