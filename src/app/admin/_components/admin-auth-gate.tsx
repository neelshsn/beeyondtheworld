'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Eye, EyeOff, KeyRound, LoaderCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AuthStatus = {
  authenticated: boolean;
  email: string | null;
  bootstrap: boolean;
};

type AdminSession = {
  email: string | null;
  loggingOut: boolean;
  logout: () => Promise<void>;
};

const AdminSessionContext = createContext<AdminSession | null>(null);

const fieldClass =
  'min-h-11 w-full rounded-none border border-white/20 bg-white/[0.06] px-3 py-2 text-base text-white outline-none transition placeholder:text-white/35 focus-visible:border-[#f4bb52] focus-visible:ring-2 focus-visible:ring-[#f4bb52]/30 sm:text-sm';
const labelClass = 'mb-2 block text-sm font-medium text-white/85';

export function useAdminSession() {
  return useContext(AdminSessionContext);
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  describedBy,
  invalid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  describedBy?: string;
  invalid?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className={`${fieldClass} pr-12`}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          minLength={8}
          required
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex min-h-11 min-w-11 items-center justify-center text-white/55 outline-none transition hover:text-[#f4bb52] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f4bb52]"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {visible ? (
            <EyeOff className="size-5" aria-hidden />
          ) : (
            <Eye className="size-5" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviteToken, setInviteToken] = useState<string | null>(() => searchParams.get('invite'));

  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [bootstrapToken, setBootstrapToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = hashParams.get('invite') ?? searchParams.get('invite');
    if (!token) return;
    setInviteToken(token);
    // The secret remains in memory only and disappears immediately from history/referrers.
    window.history.replaceState(window.history.state, '', window.location.pathname);
  }, [searchParams]);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth/status', { cache: 'no-store' });
      const payload = (await response.json()) as AuthStatus & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? `Erreur ${response.status}`);
      setStatus(payload);
      setStatusError(false);
    } catch {
      setStatusError(true);
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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!status) return;
    if (needsConfirm && password !== confirm) {
      setFormError('Les deux mots de passe doivent être identiques.');
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
      if (!response.ok) throw new Error(payload.error ?? 'La connexion a échoué.');

      setPassword('');
      setConfirm('');
      if (mode === 'invite') router.replace('/admin');
      await refresh();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'La connexion a échoué.');
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      await refresh();
      router.replace('/admin');
    } finally {
      setLoggingOut(false);
    }
  };

  if (statusError) {
    return (
      <main
        lang="fr"
        className="flex min-h-screen items-center justify-center bg-[#0d0a07] px-4 py-20 text-white"
      >
        <Card className="w-full max-w-md border-white/10 bg-white/[0.05] text-white">
          <CardHeader>
            <CardTitle className="text-xl">Impossible d’ouvrir l’Espace Bee</CardTitle>
            <CardDescription className="text-sm leading-6 text-white/60">
              Rien n’a été modifié. Vérifie ta connexion internet, puis réessaie.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              className="min-h-11 w-full rounded-none bg-[#f4bb52] text-black hover:bg-[#ffd27a] focus-visible:ring-[#f4bb52]"
              onClick={() => {
                setStatusError(false);
                setStatus(null);
                void refresh();
              }}
            >
              <RefreshCw className="size-4" aria-hidden /> Réessayer
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!status) {
    return (
      <main
        lang="fr"
        className="flex min-h-screen items-center justify-center bg-[#0d0a07] px-4 text-white"
      >
        <p
          className="flex items-center gap-3 text-sm text-white/65"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle className="size-5 animate-spin text-[#f4bb52]" aria-hidden />
          Ouverture de l’Espace Bee…
        </p>
      </main>
    );
  }

  if (!status.authenticated) {
    const title =
      mode === 'invite'
        ? 'Bienvenue dans ton Espace Bee'
        : mode === 'bootstrap'
          ? 'Créer le premier accès'
          : 'Ouvrir l’Espace Bee';
    const description =
      mode === 'invite'
        ? 'Choisis un mot de passe. Tu utiliseras ensuite ce même mot de passe pour revenir ici.'
        : mode === 'bootstrap'
          ? 'Première configuration : renseigne le compte principal et le code de sécurité transmis par Rachid.'
          : 'Entre ton e-mail professionnel et ton mot de passe.';

    return (
      <main
        lang="fr"
        className="flex min-h-screen items-center justify-center bg-[#0d0a07] px-4 py-20 text-white sm:px-6"
      >
        <Card className="w-full max-w-md rounded-none border-white/10 bg-[#17120e] text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
          <CardHeader className="space-y-5 p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/icones/Ico Gold BEE-13.svg"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-xs uppercase tracking-[0.28em] text-[#f4bb52]">Espace Bee</span>
            </div>
            <div className="space-y-2">
              <CardTitle className="flex items-start gap-2 text-xl leading-7">
                <KeyRound className="mt-1 size-5 shrink-0 text-[#f4bb52]" aria-hidden />
                {title}
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-white/60">
                {description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-7 sm:pt-0">
            <form onSubmit={submit} className="space-y-5" aria-describedby="admin-form-help">
              <p id="admin-form-help" className="sr-only">
                Tous les champs obligatoires doivent être remplis.
              </p>

              {mode !== 'invite' ? (
                <div>
                  <label className={labelClass} htmlFor="admin-email">
                    E-mail professionnel
                  </label>
                  <input
                    id="admin-email"
                    className={fieldClass}
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(formError) || undefined}
                    required
                  />
                </div>
              ) : null}

              {mode === 'bootstrap' ? (
                <div>
                  <label className={labelClass} htmlFor="admin-security-code">
                    Code de sécurité
                  </label>
                  <input
                    id="admin-security-code"
                    className={fieldClass}
                    type="password"
                    autoComplete="off"
                    value={bootstrapToken}
                    onChange={(event) => setBootstrapToken(event.target.value)}
                    aria-invalid={Boolean(formError) || undefined}
                    required
                  />
                </div>
              ) : null}

              <PasswordField
                id="admin-password"
                label={needsConfirm ? 'Choisis un mot de passe' : 'Mot de passe'}
                value={password}
                onChange={setPassword}
                autoComplete={needsConfirm ? 'new-password' : 'current-password'}
                describedBy={
                  needsConfirm
                    ? `admin-password-help${formError ? ' admin-form-error' : ''}`
                    : formError
                      ? 'admin-form-error'
                      : undefined
                }
                invalid={Boolean(formError)}
              />

              {needsConfirm ? (
                <>
                  <p id="admin-password-help" className="-mt-3 text-xs leading-5 text-white/50">
                    Utilise au moins 8 caractères.
                  </p>
                  <PasswordField
                    id="admin-password-confirm"
                    label="Écris le même mot de passe une seconde fois"
                    value={confirm}
                    onChange={setConfirm}
                    autoComplete="new-password"
                    describedBy={formError ? 'admin-form-error' : undefined}
                    invalid={Boolean(formError)}
                  />
                </>
              ) : null}

              {formError ? (
                <p
                  id="admin-form-error"
                  className="border-l-2 border-red-400 pl-3 text-sm leading-6 text-red-300"
                  role="alert"
                >
                  {formError}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={submitting}
                className="min-h-11 w-full rounded-none bg-[#f4bb52] text-black hover:bg-[#ffd27a] focus-visible:ring-[#f4bb52]"
              >
                {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
                {mode === 'invite'
                  ? 'Entrer dans mon Espace Bee'
                  : mode === 'bootstrap'
                    ? 'Créer l’accès'
                    : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <AdminSessionContext.Provider value={{ email: status.email, loggingOut, logout }}>
      {children}
    </AdminSessionContext.Provider>
  );
}
