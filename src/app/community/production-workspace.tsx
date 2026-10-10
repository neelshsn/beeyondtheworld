'use client';
import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import useEmblaCarousel from 'embla-carousel-react';
import { OnboardingDialog } from './onboarding-dialog';
import { journeyArtwork } from '@/lib/community/artwork';
import { Icon } from './horizon-icons';
import { RecordEditor, type Editor } from './studio-workspace';
import { roleNames, type CommunityRecord, type Workspace } from '@/lib/community/types';
import { studioImage } from '@/lib/community/studio';
import { statusLabel, kinds } from '@/lib/community/model';

export const productionPages = [
  'call-sheet',
  'calendar',
  'post-calendar',
  'itinerary',
  'team',
  'bookings',
];
const value = (r: CommunityRecord | undefined, key: string, fallback = 'Pending') =>
  String(r?.data[key] || fallback);
function Photo({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" />;
}
export function ProductionWorkspace({
  w,
  page,
  refresh,
  go,
}: {
  w: Workspace;
  page: string;
  refresh: () => Promise<unknown>;
  go: (id: string) => void;
}) {
  const [day, setDay] = useState(''),
    [editor, setEditor] = useState<Editor | null>(null),
    [member, setMember] = useState(''),
    [query, setQuery] = useState(''),
    [inviteOpen, setInviteOpen] = useState(false);
  const [daysRef, daysApi] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' });
  const events = w.records
    .filter(
      (r) =>
        r.kind === 'studio:activity' &&
        (page !== 'post-calendar' ||
          ['Editing', 'Review', 'Delivery'].includes(String(r.data.category)))
    )
    .sort((a, b) =>
      `${a.data.date || ''} ${a.data.start || ''}`.localeCompare(
        `${b.data.date || ''} ${b.data.start || ''}`
      )
    );
  const dates = [...new Set(events.map((r) => String(r.data.date || 'Unscheduled')))];
  if (!dates.length) dates.push(w.project.starts_on || 'Unscheduled');
  const activeDay = dates.includes(day) ? day : dates[0];
  const today = events.filter((r) => String(r.data.date || 'Unscheduled') === activeDay);
  const places = w.records.filter((r) => r.kind === 'studio:place');
  const image = (r?: CommunityRecord) =>
    studioImage(r, w, journeyArtwork(w.project, String(r?.data.imageAsset || 'landscape')));
  const open = (r: CommunityRecord) => setEditor({ kind: r.kind, record: r });
  const add = (kind: string, initial: Editor['initial'] = {}) => setEditor({ kind, initial });
  const editorAllowed = (kind: string) => kinds[kind]?.roles.includes(w.project.role);
  const team = w.members.filter(
    (m) =>
      (!member || m.id === member) &&
      `${m.name} ${roleNames[m.role]}`.toLowerCase().includes(query.toLowerCase())
  );
  const readiness = (id: string) =>
    w.records.find((r) => r.kind === 'studio:readiness' && r.data.memberId === id);
  const checks = [
    ['contract', 'Agreement', 'file'],
    ['travel', 'Travel', 'plane'],
    ['stay', 'Accommodation', 'home'],
    ['equipment', 'Equipment', 'camera'],
    ['permit', 'Visa / permits', 'shield'],
    ['brief', 'Brief', 'book'],
  ];
  const downloadPlan = () => {
    const escape = (s: unknown) =>
      String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('"', '&quot;');
    const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>${escape(w.project.title)} — ${escape(activeDay)}</title><style>body{font:16px Arial;margin:50px;color:#244555}h1{font:36px Georgia}table{width:100%;border-collapse:collapse}td,th{padding:16px;text-align:left;border-bottom:1px solid #aaa}small{color:#666}@media print{body{margin:20mm}}</style><small>BEEYONDTHEWORLD · ${w.project.is_demo ? 'ILLUSTRATIVE DEMO' : 'PRODUCTION PLAN'}</small><h1>${escape(w.project.title)}</h1><p>${escape(activeDay)} · ${escape(w.project.territory)}</p><table><tr><th>Time</th><th>Activity</th><th>Location</th><th>Details</th></tr>${today.map((r) => `<tr><td>${escape(value(r, 'start', ''))} – ${escape(value(r, 'end', ''))}</td><td>${escape(r.title)}</td><td>${escape(places.find((p) => p.id === r.data.placeId)?.title || 'To confirm')}</td><td>${escape(value(r, 'description', ''))}</td></tr>`).join('')}</table><p>Latest export: ${new Date().toISOString()}</p></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' })),
      link = document.createElement('a');
    link.href = url;
    link.download = `beeyond-day-plan-${activeDay}.html`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const resources = (ids: string[]) =>
    w.records.filter(
      (r) =>
        ids.includes(r.kind.replace('horizon:', '')) ||
        (r.kind === 'booking' &&
          ids.some(
            (id) =>
              (
                ({
                  transport: 'Transport',
                  stay: 'Accommodation',
                  catering: 'Catering',
                  equipment: 'Production',
                }) as Record<string, string>
              )[id] === r.data.category
          ))
    );
  const resourceList = (ids: string[]) => (
    <div className="production-resource-list">
      {['bee', 'production'].includes(w.project.role) &&
        ids.some((id) => ['transport', 'stay', 'catering', 'equipment'].includes(id)) && (
          <button
            className="text-link"
            onClick={() =>
              add('booking', {
                category:
                  (
                    {
                      transport: 'Transport',
                      stay: 'Accommodation',
                      catering: 'Catering',
                      equipment: 'Production',
                    } as Record<string, string>
                  )[ids[0]] || 'Production',
              })
            }
          >
            <Icon name="plus" />
            Book a provider
          </button>
        )}
      {resources(ids).map((r) => (
        <button key={r.id} onClick={() => open(r)}>
          <Icon name="file" />
          <span>
            <strong>{r.title}</strong>
            <small>
              {statusLabel(r.status)} · {r.files?.length || 0} files
            </small>
          </span>
          <Icon name="arrow" />
        </button>
      ))}
      {!resources(ids).length && <p>No resources recorded for this journey.</p>}
      {ids.map(
        (id) =>
          editorAllowed('horizon:' + id) && (
            <button className="studio-add" key={id} onClick={() => add('horizon:' + id)}>
              <Icon name="plus" />
              Add {kinds['horizon:' + id]?.label || id}
            </button>
          )
      )}
    </div>
  );
  const teamCards = (
    <div className="production-team-grid">
      {team.map((m) => {
        const r = readiness(m.id),
          done = checks.filter(([key]) => r?.data[key] && r.data[key] !== 'Pending').length;
        return (
          <article className="studio-glass production-person" key={m.id}>
            <header>
              <h3>{roleNames[m.role]}</h3>
              <small>
                {done} / {checks.length}
              </small>
            </header>
            <div className="production-person-name">
              <span className="production-avatar">
                <Icon name="user" />
              </span>
              <span>
                {m.name}
                <small>{m.organization}</small>
              </span>
            </div>
            <ul>
              {checks.map(([key, label, icon]) => (
                <li key={key}>
                  <Icon name={r?.data[key] && r.data[key] !== 'Pending' ? 'check' : icon} />
                  <span>{label}</span>
                  <small>{value(r, key)}</small>
                </li>
              ))}
            </ul>
            <button
              className="text-link"
              onClick={() => {
                setMember(m.id);
                if (r) open(r);
                else add('studio:readiness', { memberId: m.id });
              }}
            >
              View readiness
              <Icon name="arrow" />
            </button>
          </article>
        );
      })}
    </div>
  );
  return (
    <div className={`studio production-workspace production-${page}`}>
      <header className="production-heading">
        <div>
          <small>
            {w.project.title} / {w.project.territory}
          </small>
          <h1>
            {page === 'team'
              ? 'Team & bookings'
              : page === 'bookings'
                ? 'Your bookings'
                : page === 'itinerary'
                  ? 'Itinerary'
                  : page === 'post-calendar'
                    ? 'Post-production'
                    : 'Production'}
          </h1>
          <p>
            {['team', 'bookings'].includes(page)
              ? 'Build and prepare the team for this journey.'
              : 'Daily plan, team schedule and the next handoff.'}
          </p>
        </div>
        <div className="production-heading-actions">
          <button onClick={() => go('project')}>
            <Icon name="compass" />
            Journey overview
          </button>
          {!['team', 'bookings'].includes(page) && (
            <button className="main-action" onClick={downloadPlan}>
              <Icon name="download" />
              Export day plan
            </button>
          )}
        </div>
      </header>
      {['team', 'bookings'].includes(page) ? (
        <>
          <div className="production-campaign-banner studio-glass">
            <Photo src={image()} alt={w.project.territory} />
            <div>
              <h2>{w.project.title}</h2>
              <p>
                {w.project.starts_on || 'Dates to confirm'} —{' '}
                {w.project.ends_on || 'Dates to confirm'}
              </p>
              <p>
                {w.members.length} members ·{' '}
                {w.project.is_demo
                  ? 'Historical production / demo workflow'
                  : 'Assigned production team'}
              </p>
            </div>
            <div>
              <label>
                Find a team member
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name or discipline"
                />
              </label>
              <select
                aria-label="Team member"
                value={member}
                onChange={(e) => setMember(e.target.value)}
              >
                <option value="">All members</option>
                {w.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            {editorAllowed('horizon:team-invite') && (
              <button className="studio-add" onClick={() => setInviteOpen(true)}>
                <Icon name="plus" />
                Invite a team member
              </button>
            )}
          </div>
          {page === 'team' ? (
            teamCards
          ) : (
            <div className="production-booking-grid">
              {[
                ['Travel', 'plane', 'transport'],
                ['Stay', 'home', 'stay'],
                ['Table', 'sun', 'catering'],
                ['Transfers', 'car', 'transport'],
              ].map(([label, icon, id]) => (
                <section className="studio-glass" key={label}>
                  <Icon name={icon} />
                  <h2>{label}</h2>
                  {resourceList([id])}
                </section>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="production-layout">
          <aside className="production-rail">
            <h2>{w.project.territory}</h2>
            {[
              ['Scouting', 'scouting'],
              ['Final proposal', 'creative-lock'],
              ['Team & bookings', 'team'],
              ['Production', 'call-sheet'],
              ['Rushes & raw files', 'raws'],
              ['Post-production', 'handoff'],
            ].map(([label, id], i) => (
              <button
                aria-current={page === id ? 'step' : undefined}
                key={id}
                onClick={() => go(id)}
              >
                <small>{String(i + 1).padStart(2, '0')}</small>
                <span>{label}</span>
              </button>
            ))}
            <Photo src={image()} alt={w.project.territory} />
          </aside>
          <div className="production-main">
            <section className="production-days" aria-label="Production days">
              <button aria-label="Previous days" onClick={() => daysApi?.scrollPrev()}>
                <Icon name="back" />
              </button>
              <div className="production-days-viewport" ref={daysRef}>
                <div>
                  {dates.map((date, i) => (
                    <button
                      className={date === activeDay ? 'selected' : ''}
                      key={date}
                      onClick={() => setDay(date)}
                    >
                      <Photo
                        src={image(places[i % Math.max(1, places.length)])}
                        alt={places[i % Math.max(1, places.length)]?.title || w.project.territory}
                      />
                      <span>
                        <small>DAY {String(i + 1).padStart(2, '0')}</small>
                        {date}
                        <small>
                          {events.filter((e) => e.data.date === date).length} activities
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <button aria-label="Next days" onClick={() => daysApi?.scrollNext()}>
                <Icon name="arrow" />
              </button>
            </section>
            <div className="production-schedule-grid">
              <section className="studio-glass production-schedule">
                <Tabs.Root defaultValue={page === 'calendar' ? 'team' : 'plan'}>
                  <Tabs.List className="studio-tabs" aria-label="Daily production">
                    <Tabs.Trigger value="plan">Daily plan</Tabs.Trigger>
                    <Tabs.Trigger value="team">Team</Tabs.Trigger>
                    <Tabs.Trigger value="transport">Transport</Tabs.Trigger>
                    <Tabs.Trigger value="stay">Stay</Tabs.Trigger>
                    <Tabs.Trigger value="equipment">Equipment</Tabs.Trigger>
                    <Tabs.Trigger value="notes">Notes</Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="plan">
                    <header>
                      <h2>{activeDay}</h2>
                      <small>{today.length} activities</small>
                    </header>
                    <div className="production-timeline">
                      {today.map((r) => (
                        <button key={r.id} onClick={() => open(r)}>
                          <span className="production-hour">
                            {value(r, 'start', 'Time to confirm')}
                          </span>
                          <span className="production-time-dot" />
                          <Icon
                            name={
                              (
                                {
                                  Shoot: 'camera',
                                  Transport: 'car',
                                  Meal: 'sun',
                                  Fitting: 'hanger',
                                  Wrap: 'flag',
                                  Editing: 'film',
                                } as Record<string, string>
                              )[value(r, 'category')] || 'clock'
                            }
                          />
                          <span>
                            <strong>{r.title}</strong>
                            <small>
                              {places.find((p) => p.id === r.data.placeId)?.title ||
                                value(r, 'description', 'Location to confirm')}
                            </small>
                          </span>
                          <small className="production-event-state">
                            {value(r, 'state', 'Planned')}
                          </small>
                          <Icon name="arrow" />
                        </button>
                      ))}
                    </div>
                    {!today.length && (
                      <p className="studio-notes">
                        The day is not planned yet. Add the first activity.
                      </p>
                    )}
                    {editorAllowed('studio:activity') && (
                      <button
                        className="studio-add wide"
                        onClick={() =>
                          add('studio:activity', {
                            date: activeDay === 'Unscheduled' ? '' : activeDay,
                            state: 'Planned',
                          })
                        }
                      >
                        <Icon name="plus" />
                        Add activity
                      </button>
                    )}
                  </Tabs.Content>
                  <Tabs.Content value="team">
                    <div className="team-gantt">
                      <h2>Team allocation</h2>
                      <div className="source-table-wrap">
                        <table className="source-table">
                          <thead>
                            <tr>
                              <th>Role / team member</th>
                              {dates.map((d) => (
                                <th key={d}>{d}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {team.map((m) => {
                              const assigned = w.records.filter(
                                (r) => r.kind === 'studio:availability' && r.data.memberId === m.id
                              );
                              return (
                                <tr key={m.id}>
                                  <td>
                                    {roleNames[m.role]}
                                    <small>{m.name}</small>
                                  </td>
                                  {dates.map((d) => {
                                    const r = assigned.find(
                                      (r) => String(r.data.starts) <= d && String(r.data.ends) >= d
                                    );
                                    return (
                                      <td key={d}>
                                        <button
                                          className={`gantt-cell ${r ? 'gantt-' + String(r.data.state).toLowerCase() : ''}`}
                                          aria-label={`${m.name}, ${d}, ${r ? String(r.data.state) : 'unassigned'}`}
                                          disabled={!r && !editorAllowed('studio:availability')}
                                          onClick={() =>
                                            r
                                              ? open(r)
                                              : add('studio:availability', {
                                                  memberId: m.id,
                                                  starts: d,
                                                  ends: d,
                                                  state: 'Proposed',
                                                })
                                          }
                                        >
                                          {r ? String(r.data.state) : 'Assign'}
                                        </button>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Tabs.Content>
                  <Tabs.Content value="transport">{resourceList(['transport'])}</Tabs.Content>
                  <Tabs.Content value="stay">{resourceList(['stay', 'catering'])}</Tabs.Content>
                  <Tabs.Content value="equipment">{resourceList(['equipment'])}</Tabs.Content>
                  <Tabs.Content value="notes">
                    <div className="production-resource-list">
                      {today
                        .filter((r) => r.data.notes)
                        .map((r) => (
                          <button key={r.id} onClick={() => open(r)}>
                            <Icon name="message" />
                            <span>
                              {r.title}
                              <small>{value(r, 'notes', '')}</small>
                            </span>
                          </button>
                        ))}
                      {!today.some((r) => r.data.notes) && (
                        <p>No notes recorded for this day. Open an activity to add its notes.</p>
                      )}
                    </div>
                  </Tabs.Content>
                </Tabs.Root>
              </section>
              <aside className="production-side">
                <section className="studio-glass">
                  <h3>Day plan</h3>
                  <p>
                    {today.length} activities · {w.project.territory}
                  </p>
                  <p>Download a printable plan with the current times, places and instructions.</p>
                  <button className="main-action" onClick={downloadPlan}>
                    <Icon name="download" />
                    Export day plan
                  </button>
                </section>
                <section className="studio-glass">
                  <h3>Locations & access</h3>
                  {[...new Set(today.map((r) => r.data.placeId))].map((id) => {
                    const place = places.find((p) => p.id === id);
                    return place ? (
                      <button key={place.id} onClick={() => open(place)}>
                        <Icon name="pin" />
                        <span>
                          {place.title}
                          <small>{value(place, 'permit', 'Permit pending')}</small>
                        </span>
                        <Icon name="arrow" />
                      </button>
                    ) : null;
                  })}
                  <button className="text-link" onClick={() => go('scouting')}>
                    Review locations
                    <Icon name="arrow" />
                  </button>
                </section>
                <section className="studio-glass">
                  <h3>Documents</h3>
                  {resourceList(['call-sheet', 'agreements'])}
                </section>
              </aside>
            </div>
          </div>
        </div>
      )}
      {inviteOpen && <OnboardingDialog kind="invite" w={w} close={() => setInviteOpen(false)} />}
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
    </div>
  );
}
