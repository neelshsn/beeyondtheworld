import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Inbox, MapPinned, PanelsTopLeft } from 'lucide-react';

import { InviteEditorCard } from './_components/invite-editor-card';

export const metadata: Metadata = {
  title: 'Espace Bee - Beeyondtheworld',
  description: 'L’espace simple pour mettre à jour les contenus Beeyondtheworld.',
};

const sections = [
  {
    href: '/admin/campaigns',
    title: 'Campagnes & Tales',
    description:
      'Change les textes, les images et les vidéos, puis choisis le format Tale ou Gallery.',
    action: 'Ouvrir les campagnes',
    icon: PanelsTopLeft,
  },
  {
    href: '/admin/journeys',
    title: 'Voyages & Locations',
    description: 'Mets à jour les destinations, les dates, les saisons et chaque Location.',
    action: 'Ouvrir les voyages',
    icon: MapPinned,
  },
  {
    href: '/admin/leads',
    title: 'Demandes reçues',
    description: 'Retrouve les messages envoyés depuis le site et les demandes liées aux voyages.',
    action: 'Voir les demandes',
    icon: Inbox,
  },
] as const;

function AdminHomeContent() {
  return (
    <main className="min-h-screen bg-[#0d0a07] px-4 pb-20 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#f4bb52]">
            Gestion du site
          </p>
          <h1 className="mt-4 text-[1.65rem] font-medium leading-tight sm:text-4xl">
            Que veux-tu modifier ?
          </h1>
          <p className="mt-4 text-base leading-7 text-white/65">
            Choisis une rubrique. Tu retrouveras ensuite chaque contenu avec son nom et son image.
          </p>
        </header>

        <section aria-label="Rubriques de l’Espace Bee" className="mt-10 grid gap-4 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.href}
                href={section.href}
                className="group flex min-h-64 flex-col border border-white/[0.12] bg-white/[0.04] p-5 outline-none transition hover:-translate-y-1 hover:border-[#f4bb52]/65 hover:bg-[#f4bb52]/[0.06] focus-visible:ring-2 focus-visible:ring-[#f4bb52] sm:p-7"
              >
                <span className="flex size-12 items-center justify-center border border-[#f4bb52]/45 text-[#f4bb52]">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h2 className="mt-7 text-xl font-medium">{section.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-white/60">{section.description}</p>
                <span className="mt-7 flex min-h-11 items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm font-medium text-white transition group-hover:text-[#f4bb52]">
                  {section.action}
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </span>
              </Link>
            );
          })}
        </section>

        <div className="mt-8 border border-white/10 bg-white/[0.025] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div>
            <h2 className="text-base font-medium">Vérifier le site public</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Ouvre le site dans un nouvel onglet pour contrôler le résultat final.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#f4bb52] px-5 text-sm font-medium text-[#f4bb52] outline-none transition hover:bg-[#f4bb52] hover:text-black focus-visible:ring-2 focus-visible:ring-[#f4bb52] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0a07] sm:mt-0 sm:w-auto"
          >
            Voir le site <ExternalLink className="size-4" aria-hidden />
          </Link>
        </div>

        <section className="mt-8 border-t border-white/10 pt-8" aria-labelledby="admin-help-title">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#f4bb52]">
            Mode d’emploi
          </p>
          <h2 id="admin-help-title" className="mt-3 text-xl font-medium">
            Trois gestes, toujours dans le même ordre
          </h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              ['1', 'Ouvre une rubrique', 'Choisis Campagnes, Voyages ou Demandes.'],
              [
                '2',
                'Fais ton changement',
                'Écris ton texte ou choisis un fichier depuis ton appareil.',
              ],
              [
                '3',
                'Enregistre puis publie',
                'Dans Campagnes, le brouillon ne change pas le site avant le clic sur Publier.',
              ],
            ].map(([number, title, description]) => (
              <li key={number} className="flex gap-4 border border-white/10 bg-white/[0.025] p-4">
                <span className="flex size-9 shrink-0 items-center justify-center border border-[#f4bb52]/50 text-sm text-[#f4bb52]">
                  {number}
                </span>
                <div>
                  <h3 className="text-sm font-medium text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/55">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <InviteEditorCard />
      </div>
    </main>
  );
}

export default function AdminPage() {
  return <AdminHomeContent />;
}
