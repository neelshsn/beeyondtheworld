'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Eye, EyeOff, KeyRound } from 'lucide-react';
import '../horizon.css';
import '../source-workspaces.css';
export function PasswordResetForm() {
  const token = useRef('');
  const initialized = useRef(false);
  const [name, setName] = useState(''),
    [error, setError] = useState(''),
    [password, setPassword] = useState(''),
    [confirmation, setConfirmation] = useState(''),
    [ready, setReady] = useState(false),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false),
    [visible, setVisible] = useState(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    token.current = location.hash.slice(1);
    // Keep the secret out of subsequent history entries and referrer data.
    history.replaceState(null, '', location.pathname);
    fetch('/api/community/password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.current, preview: true }),
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setName(d.name);
        setReady(true);
      })
      .catch((e) => setError(e.message));
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/community/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.current, password, confirmation }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      token.current = '';
      setPassword('');
      setConfirmation('');
      setDone(true);
      setReady(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="horizon join-page">
      <section className="source-panel" style={{ maxWidth: 560, width: '100%', margin: 'auto' }}>
        <span className="eyebrow">BEEYONDTHEWORLD · COMMUNITY</span>
        {done ? (
          <>
            <Check size={30} aria-hidden="true" />
            <h1>A fresh beginning.</h1>
            <p>
              Your Community password has been updated. Sign in again to open Community and the
              Creative Studio. Previous Community sessions have ended.
            </p>
            <Link className="source-export" href="/community">
              Sign in <ArrowRight size={16} />
            </Link>
          </>
        ) : (
          <>
            <KeyRound size={30} aria-hidden="true" style={{ marginTop: 24 }} />
            <h1>Your own key.</h1>
            <p>
              {ready
                ? `${name}, choose a new password for Community and the Creative Studio.`
                : 'Opening your recovery link…'}
            </p>
            {ready && (
              <form onSubmit={submit}>
                <label>
                  New password
                  <input
                    type={visible ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={200}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                <label>
                  Confirm new password
                  <input
                    type={visible ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={200}
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="text-link"
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={16} /> : <Eye size={16} />}{' '}
                  {visible ? 'Hide passwords' : 'Show passwords'}
                </button>
                <p style={{ fontSize: 13 }}>
                  Use at least 12 characters. This personal link can be used once.
                </p>
                <button type="submit" className="source-export" disabled={busy}>
                  {busy ? 'Saving…' : 'Save new password'}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </>
        )}
        {error && <p role="alert">{error}</p>}
        {!ready && !done && error && (
          <p>
            <a href="mailto:rachid@beeyondtheworld.com">Ask the Bee team for a new link</a>
          </p>
        )}
      </section>
    </main>
  );
}
