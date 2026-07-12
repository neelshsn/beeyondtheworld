'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { KeyRound, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AuthStatus = {
  authenticated: boolean;
  email: string | null;
  bootstrap: boolean;
};

const fieldClass =
  'w-full rounded-none border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#f4bb52]';

/**
 * T-050 — porte d'authentification du CMS (auth Neon, cookie httpOnly).
 * Premier lancement : création du compte éditeur (bootstrap), ensuite login.
 */
export function AdminAuthGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth/status');
      const payload = (await response.json()) as AuthStatus & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? `Erreur ${response.status}`);
      setStatus(payload);
      setStatusError(null);
    } catch (cause) {
      setStatusError(cause instanceof Error ? cause.message : 'Base indisponible');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!status) return;
    if (status.bootstrap && password !== confirm) {
      setFormError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const endpoint = status.bootstrap ? '/api/admin/auth/register' : '/api/admin/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? `Erreur ${response.status}`);
      setPassword('');
      setConfirm('');
      await refresh();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    await refresh();
  };

  if (statusError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0d0a07] px-6 text-white">
        <p className="text-sm text-red-400">Base indisponible : {statusError}</p>
      </main>
    );
  }

  if (!status) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0d0a07] px-6 text-white">
        <p className="text-sm text-white/50">Chargement…</p>
      </main>
    );
  }

  if (!status.authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0d0a07] px-6 py-24 text-white">
        <Card className="w-full max-w-md border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.3em]">
              <KeyRound className="size-4 text-[#f4bb52]" />
              {status.bootstrap ? 'Créer le compte éditeur' : 'Connexion éditeur'}
            </CardTitle>
            <CardDescription className="text-white/50">
              {status.bootstrap
                ? 'Premier lancement : choisis l’e-mail et le mot de passe du compte qui pourra éditer les voyages (stocké dans Neon).'
                : 'Accès réservé aux éditeurs — compte stocké dans Neon.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <input
                className={fieldClass}
                type="email"
                placeholder="E-mail"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <input
                className={fieldClass}
                type="password"
                placeholder="Mot de passe (8 caractères min.)"
                autoComplete={status.bootstrap ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
              {status.bootstrap ? (
                <input
                  className={fieldClass}
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  minLength={8}
                  required
                />
              ) : null}
              {formError ? <p className="text-xs text-red-400">{formError}</p> : null}
              <Button type="submit" size="sm" disabled={submitting} className="w-full">
                {status.bootstrap ? 'Créer le compte' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="relative">
      <div className="absolute right-6 top-6 z-10 flex items-center gap-3 text-xs text-white/60">
        <span>{status.email}</span>
        <Button size="sm" variant="ghost" onClick={logout} className="text-white/70">
          <LogOut className="size-4" /> Déconnexion
        </Button>
      </div>
      {children}
    </div>
  );
}
