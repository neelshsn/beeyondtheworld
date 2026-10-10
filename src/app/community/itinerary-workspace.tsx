'use client';
import { useEffect, useRef, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import type { Map as LeafletMap } from 'leaflet';
import { journeyArtwork } from '@/lib/community/artwork';
import { studioImage } from '@/lib/community/studio';
import type { CommunityRecord, Workspace } from '@/lib/community/types';
import { RecordEditor, type Editor } from './studio-workspace';
import { Icon } from './horizon-icons';
import 'leaflet/dist/leaflet.css';
const coord = (r: CommunityRecord) =>
  r.data.latitude !== undefined &&
  r.data.longitude !== undefined &&
  Number.isFinite(Number(r.data.latitude)) &&
  Number.isFinite(Number(r.data.longitude));
const distance = (a: CommunityRecord, b: CommunityRecord) => {
  const rad = (n: number) => (n * Math.PI) / 180;
  const lat = rad(Number(b.data.latitude) - Number(a.data.latitude)),
    lon = rad(Number(b.data.longitude) - Number(a.data.longitude));
  return (
    6371 *
    2 *
    Math.atan2(
      Math.sqrt(
        Math.sin(lat / 2) ** 2 +
          Math.cos(rad(Number(a.data.latitude))) *
            Math.cos(rad(Number(b.data.latitude))) *
            Math.sin(lon / 2) ** 2
      ),
      Math.sqrt(
        1 -
          (Math.sin(lat / 2) ** 2 +
            Math.cos(rad(Number(a.data.latitude))) *
              Math.cos(rad(Number(b.data.latitude))) *
              Math.sin(lon / 2) ** 2)
      )
    )
  );
};
function MapView({
  places,
  select,
}: {
  places: CommunityRecord[];
  select: (r: CommunityRecord) => void;
}) {
  const ref = useRef<HTMLDivElement>(null),
    map = useRef<LeafletMap | null>(null),
    onSelect = useRef(select);
  onSelect.current = select;
  const [error, setError] = useState('');
  const key = JSON.stringify(places.map((r) => [r.id, r.title, r.data.latitude, r.data.longitude]));
  useEffect(() => {
    let cancelled = false;
    void import('leaflet')
      .then((L) => {
        if (cancelled || !ref.current) return;
        const m = L.map(ref.current, {
          scrollWheelZoom: false,
          zoomAnimation: !matchMedia('(prefers-reduced-motion: reduce)').matches,
        });
        map.current = m;
        const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(m);
        layer.on('tileerror', () =>
          setError('Map tiles unavailable. The location list remains accessible.')
        );
        const points = places.filter(coord);
        for (const [i, r] of points.entries()) {
          const marker = L.circleMarker([Number(r.data.latitude), Number(r.data.longitude)], {
            radius: 10,
            color: '#dfbb7a',
            fillColor: '#315365',
            fillOpacity: 1,
            weight: 3,
          }).addTo(m);
          const label = document.createElement('span');
          label.textContent = i + 1 + '. ' + r.title;
          marker
            .bindTooltip(label, { permanent: true, direction: 'top' })
            .on('click', () => onSelect.current(r));
        }
        if (points.length) {
          m.fitBounds(
            L.latLngBounds(points.map((r) => [Number(r.data.latitude), Number(r.data.longitude)])),
            { padding: [40, 45], maxZoom: 12 }
          );
          if (points.length > 1)
            L.polyline(
              points.map((r) => [Number(r.data.latitude), Number(r.data.longitude)]),
              { color: '#e8c689', weight: 3, dashArray: '6 8' }
            ).addTo(m);
        } else m.setView([25, 5], 2);
      })
      .catch(() => setError('Map unavailable. Use the location list.'));
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <div className="itinerary-map" ref={ref} aria-label="Location map" />
      {error && <p role="status">{error}</p>}
      <small className="source-muted">
        Dashed lines show stop order, not a road route. Confirm driving times and access with local
        production.
      </small>
    </>
  );
}
export function ItineraryWorkspace({
  w,
  go,
  refresh,
}: {
  w: Workspace;
  go: (id: string) => void;
  refresh: () => Promise<unknown>;
}) {
  const [order, setOrder] = useState<string[] | null>(null),
    [editor, setEditor] = useState<Editor | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const route = w.records.filter((r) => r.kind === 'studio:route').at(-1);
  const saved = String(route?.data.stops || '').split(',');
  const places = w.records
    .filter((r) => r.kind === 'studio:place')
    .sort((a, b) => {
      const ids = order || saved;
      const x = ids.indexOf(a.id),
        y = ids.indexOf(b.id);
      return (x < 0 ? 999 : x) - (y < 0 ? 999 : y);
    });
  const points = places.filter(coord),
    days = [
      ...new Set(
        w.records
          .filter((r) => r.kind === 'studio:activity')
          .map((r) => r.data.date)
          .filter(Boolean)
      ),
    ];
  const km = points.slice(1).reduce((s, r, i) => s + distance(points[i], r), 0);
  const editable =
    ['bee', 'production'].includes(w.project.role) &&
    (!route || ['draft', 'needs_update'].includes(route.status));
  const image = (r?: CommunityRecord) =>
    studioImage(r, w, journeyArtwork(w.project, String(r?.data.imageAsset || 'landscape')));
  const open = (r: CommunityRecord) => setEditor({ kind: r.kind, record: r });
  const reorder = (from: number, to: number) => {
    const list = places.map((r) => r.id);
    [list[from], list[to]] = [list[to], list[from]];
    setOrder(list);
  };
  const suggest = () => {
    if (!points.length) return;
    const remaining = points.slice(1),
      result = [points[0]];
    while (remaining.length) {
      remaining.sort((a, b) => distance(result.at(-1)!, a) - distance(result.at(-1)!, b));
      result.push(remaining.shift()!);
    }
    setOrder([...result.map((r) => r.id), ...places.filter((r) => !coord(r)).map((r) => r.id)]);
  };
  return (
    <section className="itinerary-workspace">
      <header className="source-heading">
        <div>
          <span className="eyebrow">{w.project.title}</span>
          <h1>CRAFT YOUR ITINERANCE</h1>
          <p>Connect the locations, the shooting days and the people.</p>
        </div>
        <button className="source-export" onClick={() => go('calendar')}>
          <Icon name="users" />
          Team allocation
        </button>
      </header>
      <div className="itinerary-grid">
        <section className="source-panel">
          <div className="source-panel-head">
            <h2>Locations & sequence</h2>
            {editable && (
              <button className="text-link" disabled={points.length < 2} onClick={suggest}>
                Suggest nearby order <Icon name="arrow" />
              </button>
            )}
          </div>
          <Tabs.Root defaultValue="map">
            <Tabs.List className="source-tabs">
              <Tabs.Trigger value="map">Map</Tabs.Trigger>
              <Tabs.Trigger value="timeline">Timeline</Tabs.Trigger>
              <Tabs.Trigger value="list">List</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="map">
              <MapView places={places} select={open} />
            </Tabs.Content>
            <Tabs.Content value="timeline">
              {days.map((d) => (
                <button className="source-history" key={String(d)} onClick={() => go('call-sheet')}>
                  <Icon name="calendar" />
                  <span>
                    {String(d)}
                    <small>
                      {
                        w.records.filter((r) => r.kind === 'studio:activity' && r.data.date === d)
                          .length
                      }{' '}
                      activities
                    </small>
                  </span>
                  <Icon name="arrow" />
                </button>
              ))}
              {!days.length && <p>Set your first production day in the day plan.</p>}
            </Tabs.Content>
            <Tabs.Content value="list">
              {places.map((r, i) => (
                <div className="itinerary-stop" key={r.id}>
                  <small>{String(i + 1).padStart(2, '0')}</small>
                  <button onClick={() => open(r)}>
                    {r.title}
                    <span>
                      {coord(r) ? `${r.data.latitude}, ${r.data.longitude}` : 'GPS to confirm'}
                    </span>
                  </button>
                  {editable && (
                    <>
                      <button
                        aria-label={`Move ${r.title} earlier`}
                        disabled={i === 0}
                        onClick={() => reorder(i, i - 1)}
                      >
                        <Icon name="back" />
                      </button>
                      <button
                        aria-label={`Move ${r.title} later`}
                        disabled={i === places.length - 1}
                        onClick={() => reorder(i, i + 1)}
                      >
                        <Icon name="right" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </Tabs.Content>
          </Tabs.Root>
        </section>
        <aside>
          <section className="source-panel">
            <h2>Itinerary overview</h2>
            <div className="itinerary-stats">
              <span>
                <strong>{places.length}</strong>Locations
              </span>
              <span>
                <strong>{days.length}</strong>Days
              </span>
              <span>
                <strong>{points.length > 1 ? Math.round(km) : '—'}</strong>km, straight line
              </span>
            </div>
            <p>
              {points.length} of {places.length} locations have coordinates.
            </p>
            {w.project.is_demo && (
              <p>
                Illustrative planning for a historical production. Confirm all locations and
                logistics.
              </p>
            )}
            {editable && (
              <button
                className="main-action"
                disabled={!order || busy}
                onClick={async () => {
                  setBusy(true);
                  setError('');
                  try {
                    const r = await fetch('/api/community/records', {
                      method: route ? 'PATCH' : 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        projectId: w.project.id,
                        id: route?.id,
                        version: route?.version,
                        kind: 'studio:route',
                        title: 'Production itinerary',
                        data: { ...route?.data, stops: order!.join(',') },
                      }),
                    });
                    const d = await r.json();
                    if (!r.ok) throw Error(d.error);
                    await refresh();
                    setOrder(null);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Please retry.');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? 'Saving…' : 'Save route'}
                <Icon name="check" />
              </button>
            )}
            {error && <p role="alert">{error}</p>}
          </section>
          <section className="source-panel">
            <h2>Explore locations</h2>
            {places.map((r) => (
              <button className="source-history" key={r.id} onClick={() => open(r)}>
                <Icon name="pin" />
                <span>
                  {r.title}
                  <small>{String(r.data.light || 'Light to confirm')}</small>
                </span>
                <Icon name="right" />
              </button>
            ))}
            <button className="text-link" onClick={() => go('scouting')}>
              Open scouting <Icon name="arrow" />
            </button>
          </section>
        </aside>
      </div>
      {editor && (
        <RecordEditor
          key={editor.record?.id || editor.kind}
          editor={editor}
          w={w}
          close={() => setEditor(null)}
          refresh={refresh}
          image={image}
        />
      )}
    </section>
  );
}
