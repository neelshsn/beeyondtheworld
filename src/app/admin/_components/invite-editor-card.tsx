'use client';

import { Check, Copy, KeyRound, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

type Invitation = { email: string; inviteUrl: string; expiresAt: string };

export function InviteEditorCard() {
  const [email, setEmail] = useState('');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInvitation = async () => {
    setBusy(true);
    setError(null);
    setInvitation(null);
    setCopied(false);
    try {
      const response = await fetch('/api/admin/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json().catch(() => ({}))) as Invitation & { error?: string };
      if (!response.ok || !payload.inviteUrl) {
        throw new Error(payload.error ?? "L'invitation n'a pas pu être créée.");
      }
      setInvitation(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "L'invitation n'a pas pu être créée.");
    } finally {
      setBusy(false);
    }
  };

  const copyInvitation = async () => {
    if (!invitation) return;
    try {
      await navigator.clipboard.writeText(invitation.inviteUrl);
      setCopied(true);
    } catch {
      setError('La copie automatique a échoué. Sélectionne le lien puis copie-le.');
    }
  };

  return (
    <details className="mt-8 border border-white/10 bg-white/[0.025]">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 py-4 text-sm font-medium text-white outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-[#f4bb52] sm:px-6">
        <KeyRound aria-hidden="true" className="size-5 shrink-0 text-[#f4bb52]" />
        Gestion des accès (avancé)
      </summary>
      <div className="border-t border-white/10 p-5 sm:p-6">
        <h2 className="text-base font-medium">Inviter une personne</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
          Entre son e-mail. Le lien créé fonctionne une seule fois et pendant 72 heures. La personne
          choisira elle-même son mot de passe.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="mb-2 block text-xs font-medium text-white/70">Adresse e-mail</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="prenom@entreprise.com"
              className="min-h-11 w-full border border-white/20 bg-white/[0.04] px-3 text-base text-white outline-none placeholder:text-white/30 focus-visible:border-[#f4bb52] focus-visible:ring-2 focus-visible:ring-[#f4bb52]/25 sm:text-sm"
            />
          </label>
          <button
            type="button"
            disabled={busy || !email.trim()}
            onClick={() => void createInvitation()}
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#f4bb52] px-5 text-sm font-medium text-[#f4bb52] outline-none transition hover:bg-[#f4bb52] hover:text-black focus-visible:ring-2 focus-visible:ring-[#f4bb52] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {busy ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
            Créer le lien
          </button>
        </div>

        {invitation ? (
          <div className="mt-5 border border-emerald-300/25 bg-emerald-300/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm text-emerald-200" role="status">
              <Check aria-hidden="true" className="size-4" /> Lien prêt pour {invitation.email}
            </p>
            <label className="mt-3 block">
              <span className="sr-only">Lien d’invitation</span>
              <input
                readOnly
                value={invitation.inviteUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="min-h-11 w-full border border-white/15 bg-black/20 px-3 text-base text-white/80 outline-none focus-visible:border-[#f4bb52] sm:text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() => void copyInvitation()}
              className="mt-3 inline-flex min-h-11 items-center gap-2 border border-white/20 px-4 text-sm text-white/75 outline-none transition hover:border-[#f4bb52]/60 hover:text-[#f4bb52] focus-visible:ring-2 focus-visible:ring-[#f4bb52]"
            >
              {copied ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <Copy aria-hidden="true" className="size-4" />
              )}
              {copied ? 'Lien copié' : 'Copier le lien'}
            </button>
          </div>
        ) : null}
        {error ? (
          <p className="mt-4 text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </details>
  );
}
