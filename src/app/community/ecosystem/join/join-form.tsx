'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Feather, Check } from 'lucide-react';
import '../../horizon.css';
import '../../source-workspaces.css';
type Invitation = { name: string; email: string; existing: boolean; expiresAt: string };
async function api(path: string, body: unknown) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) throw Error(d.error || 'Please try again.');
  return d;
}
export function VisualPoetJoin() {
  const token = useRef(''),
    init = useRef(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false);
  useEffect(() => {
    if (init.current) return;
    init.current = true;
    token.current = location.hash.slice(1);
    history.replaceState(null, '', location.pathname);
    api('/api/community/ecosystem/invitations', { token: token.current, preview: true })
      .then(setInvitation)
      .catch((e) => setError(e.message));
  }, []);
  async function accept(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!invitation) return;
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    try {
      if (invitation.existing)
        await api('/api/community/auth', { email: invitation.email, password: f.get('password') });
      const d = await api('/api/community/ecosystem/invitations', {
        token: token.current,
        password: invitation.existing ? undefined : f.get('password'),
        confirmation: invitation.existing ? undefined : f.get('confirmation'),
      });
      token.current = '';
      setDone(true);
      location.assign(d.path);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="horizon join-page">
      <section className="source-panel" style={{ maxWidth: 560, width: '100%', margin: 'auto' }}>
        <span className="eyebrow">BEEYONDTHEWORLD · VISUAL POETS</span>
        <Feather size={30} aria-hidden style={{ marginTop: 24 }} />
        <h1>Your local vision.</h1>
        {done ? (
          <p>
            <Check aria-hidden />
            Your personal space is opening.
          </p>
        ) : invitation ? (
          <>
            <p>
              {invitation.name}, welcome to your creative space. Your profile will be reviewed by
              the BEE Studio before you can upload your destination kit.
            </p>
            <form onSubmit={accept}>
              <label>
                Email
                <input type="email" value={invitation.email} readOnly autoComplete="username" />
              </label>
              <label>
                {invitation.existing ? 'Your existing Community password' : 'Choose your password'}
                <input
                  name="password"
                  type="password"
                  autoComplete={invitation.existing ? 'current-password' : 'new-password'}
                  minLength={invitation.existing ? 1 : 12}
                  maxLength={200}
                  required
                />
              </label>
              {!invitation.existing && (
                <label>
                  Confirm your password
                  <input
                    name="confirmation"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={200}
                    required
                  />
                </label>
              )}
              <p style={{ fontSize: 13 }}>
                {invitation.existing
                  ? 'Use your existing Community account. Your password will stay the same.'
                  : 'Use at least 12 characters. This invitation opens only your own creative space.'}
              </p>
              <button className="source-export" disabled={busy}>
                {busy ? 'Opening…' : 'Open my creative space'}
                <ArrowRight size={16} />
              </button>
            </form>
          </>
        ) : (
          <p>{error ? 'Ask the Studio for a new invitation.' : 'Opening your invitation…'}</p>
        )}
        {error && <p role="alert">{error}</p>}
        <p style={{ fontSize: 13, marginTop: 24 }}>
          <a href="mailto:eugenie@beeyondtheworld.com">Contact the BEE Studio</a>
        </p>
      </section>
    </main>
  );
}
