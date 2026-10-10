'use client';
import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { roles, roleNames, type Workspace } from '@/lib/community/types';
import { Icon } from './horizon-icons';
type Invitation = {
  id: string;
  name: string;
  email: string;
  role: keyof typeof roleNames;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
};
export function OnboardingDialog({
  kind,
  w,
  close,
}: {
  kind: 'project' | 'invite';
  w: Workspace;
  close: () => void;
}) {
  const [data, setData] = useState<Record<string, string>>({ role: 'photographer' }),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [link, setLink] = useState(''),
    [copied, setCopied] = useState(false),
    [invitations, setInvitations] = useState<Invitation[]>([]);
  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));
  async function load() {
    const r = await fetch('/api/community/invitations?project=' + w.project.id, {
      cache: 'no-store',
    });
    const d = await r.json();
    if (!r.ok) throw Error(d.error);
    setInvitations(d.invitations);
  }
  useEffect(() => {
    if (kind === 'invite') void load().catch((e) => setError(e.message));
  }, [kind, w.project.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Dialog.Root open onOpenChange={(o) => !o && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="studio-overlay" />
        <Dialog.Content
          className="horizon studio-dialog onboarding-dialog"
          aria-describedby={undefined}
        >
          <div className="studio-dialog-heading">
            <Dialog.Title>
              {kind === 'project' ? 'Begin a new journey' : 'Invite a team member'}
            </Dialog.Title>
            <Dialog.Close>Close ×</Dialog.Close>
          </div>
          <p>
            {kind === 'project'
              ? 'One production, one shared workspace.'
              : `Access applies to ${w.project.title} only.`}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError('');
              setCopied(false);
              try {
                const r = await fetch(
                  '/api/community/' + (kind === 'project' ? 'projects' : 'invitations'),
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, projectId: w.project.id }),
                  }
                );
                const d = await r.json();
                if (!r.ok) throw Error(d.error);
                if (kind === 'project') {
                  location.href = '/community?project=' + d.id + '#brief-scope';
                } else {
                  setLink(location.origin + d.path);
                  await load();
                }
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Please retry.');
              } finally {
                setBusy(false);
              }
            }}
          >
            {(kind === 'project'
              ? [
                  ['title', 'Project name', 'text'],
                  ['territory', 'Destination', 'text'],
                  ['season', 'Season / collection', 'text'],
                  ['starts_on', 'Production starts', 'date'],
                  ['ends_on', 'Production ends', 'date'],
                ]
              : [
                  ['name', 'Full name', 'text'],
                  ['email', 'Work email', 'email'],
                  ['organization', 'Organization', 'text'],
                ]
            ).map(([key, label, type]) => (
              <label key={key}>
                {label}
                <input
                  required={['title', 'territory', 'name', 'email', 'organization'].includes(key)}
                  type={type}
                  value={data[key] || ''}
                  onChange={(e) => set(key, e.target.value)}
                  maxLength={type === 'email' ? 254 : 160}
                />
              </label>
            ))}
            {kind === 'invite' && (
              <label>
                Role
                <select value={data.role} onChange={(e) => set('role', e.target.value)}>
                  {roles
                    .filter(
                      (r) =>
                        w.project.role === 'bee' || !['bee', 'brand', 'ngo', 'expert'].includes(r)
                    )
                    .map((r) => (
                      <option value={r} key={r}>
                        {roleNames[r]}
                      </option>
                    ))}
                </select>
              </label>
            )}
            {kind === 'project' && w.user.is_test && (
              <small>This test account creates isolated demonstration journeys.</small>
            )}
            <button className="main-action" disabled={busy}>
              {busy
                ? 'Preparing…'
                : kind === 'project'
                  ? 'Create journey'
                  : 'Create invitation link'}
              <Icon name="arrow" />
            </button>
          </form>
          {link && (
            <section className="invitation-result">
              <h3>Invitation ready</h3>
              <p>Valid for seven days. Share this private link with the invited person.</p>
              <input
                aria-label="Invitation link"
                value={link}
                readOnly
                onFocus={(e) => e.target.select()}
              />
              <button
                className="text-link"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                    setCopied(true);
                  } catch {
                    setError('Select and copy the invitation link.');
                  }
                }}
              >
                {copied ? 'Copied' : 'Copy invitation link'}
                <Icon name="file" />
              </button>
            </section>
          )}
          {kind === 'invite' && (
            <section>
              <h3>Invitations</h3>
              {invitations.map((i) => (
                <div className="source-history" key={i.id}>
                  <span>
                    {i.name}
                    <small>
                      {roleNames[i.role]} ·{' '}
                      {i.accepted_at
                        ? 'Accepted'
                        : i.revoked_at
                          ? 'Revoked'
                          : new Date(i.expires_at) < new Date()
                            ? 'Expired'
                            : 'Pending'}
                    </small>
                  </span>
                  {!i.accepted_at && !i.revoked_at && (
                    <button
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          const r = await fetch('/api/community/invitations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ projectId: w.project.id, revoke: i.id }),
                          });
                          if (!r.ok) throw Error('Could not revoke invitation.');
                          setLink('');
                          await load();
                        } catch (e) {
                          setError(e instanceof Error ? e.message : 'Please retry.');
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
              {!invitations.length && <p>No invitations yet.</p>}
            </section>
          )}
          {error && (
            <p role="alert" className="studio-error">
              {error}
            </p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
