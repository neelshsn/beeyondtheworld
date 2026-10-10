'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { roleNames, type Role } from '@/lib/community/types';
import '../horizon.css';
import '../source-workspaces.css';
type Invitation = { name: string; email: string; project: string; role: Role; existing: boolean };
export default function Join() {
  const [invite, setInvite] = useState<Invitation | null>(null),
    [error, setError] = useState(''),
    [password, setPassword] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch('/api/community/invitations/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: location.hash.slice(1), preview: true }),
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setInvite(d);
      })
      .catch((e) => setError(e.message));
  }, []);
  return (
    <main className="horizon join-page">
      <section className="source-panel">
        <small className="eyebrow">BEEYONDTHEWORLD</small>
        <h1>A place in the hive</h1>
        {invite ? (
          <>
            <p>
              {invite.name}, join {invite.project} as {roleNames[invite.role]}.
            </p>
            <p>{invite.email}</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError('');
                try {
                  const r = await fetch('/api/community/invitations/accept', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: location.hash.slice(1), password }),
                  });
                  const d = await r.json();
                  if (!r.ok) throw Error(d.error);
                  location.href = '/community?project=' + d.projectId;
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Please retry.');
                } finally {
                  setBusy(false);
                }
              }}
            >
              {invite.existing ? (
                <p>
                  <Link href="/community" target="_blank">
                    Sign in with your existing account
                  </Link>
                  , then accept this invitation.
                </p>
              ) : (
                <label>
                  Create your password
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={200}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              )}
              <button className="source-export" disabled={busy}>
                {busy ? 'Joining…' : 'Accept invitation'}
              </button>
            </form>
          </>
        ) : (
          !error && <p>Opening your invitation…</p>
        )}
        {error && <p role="alert">{error}</p>}
      </section>
    </main>
  );
}
