'use client';

import { useRouter, useSearchParams } from 'next/navigation';
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
 * Trois modes : bootstrap (1er compte), invitation (?invite=TOKEN → l'invité
 * choisit son mot de passe), login classique.
 */
export function AdminAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [bootstrapToken, setBootstrapToken] = useState('');
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

  const mode: 'invite' | 'bootstrap' | 'login' = inviteToken
    ? 'invite'
    : status?.bootstrap
      ? 'bootstrap'
      : 'login';
  const needsConfirm = mode === 'invite' || mode === 'bootstrap';

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!status) return;
    if (needsConfirm && password !== confirm) {
      setFormError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const endpoint =
        mode === 'invite'
          ? '/api/admin/auth/setup'
          : mode === 'bootstrap'
            ? '/api/admin/auth/register'
            : '/api/admin/auth/login';
      const body =
        mode === 'invite'
          ? { token: inviteToken, password }
          : { email, password, bootstrapToken: mode === 'bootstrap' ? bootstrapToken : undefined };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? `Erreur ${response.status}`);
      setPassword('');
      setConfirm('');
      if (mode === 'invite') {
        // Retire le token de l'URL une fois consommé.
        router.replace('/admin/journeys');
      }
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
    const title =
      mode === 'invite'
        ? 'Bienvenue — choisis ton mot de passe'
        : mode === 'bootstrap'
          ? 'Créer le compte éditeur'
          : 'Connexion éditeur';
    const description =
      mode === 'invite'
        ? 'Ton compte éditeur est prêt : choisis simplement ton mot de passe pour l’activer (lien à usage unique).'
        : mode === 'bootstrap'
          ? 'Premier lancement : choisis l’e-mail et le mot de passe du compte qui pourra éditer les voyages (stocké dans Neon).'
          : 'Accès réservé aux éditeurs — compte stocké dans Neon.';

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0d0a07] px-6 py-24 text-white">
        <Card className="w-full max-w-md border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.3em]">
              <KeyRound className="size-4 text-[#f4bb52]" />
              {title}
            </CardTitle>
            <CardDescription className="text-white/50">{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              {mode !== 'invite' ? (
                <input
                  className={fieldClass}
                  type="email"
                  placeholder="E-mail"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              ) : null}
              {mode === 'bootstrap' ? (
                <input
                  className={fieldClass}
                  type="password"
                  placeholder="Code de bootstrap administrateur"
                  autoComplete="off"
                  value={bootstrapToken}
                  onChange={(event) => setBootstrapToken(event.target.value)}
                  required
                />
              ) : null}
              <input
                className={fieldClass}
                type="password"
                placeholder="Mot de passe (8 caractères min.)"
                autoComplete={needsConfirm ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
              {needsConfirm ? (
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
                {mode === 'invite'
                  ? 'Activer mon compte'
                  : mode === 'bootstrap'
                    ? 'Créer le compte'
                    : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="relative">
      <div className="absolute right-6 top-20 z-10 flex items-center gap-3 text-xs text-white/60">
        <span className="hidden sm:inline">{status.email}</span>
        <Button size="sm" variant="ghost" onClick={logout} className="text-white/70">
          <LogOut className="size-4" /> Déconnexion
        </Button>
      </div>
      {children}
    </div>
  );
}
