'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, House, Inbox, LogOut, MapPinned, PanelsTopLeft } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useAdminSession } from './admin-auth-gate';

const navigation = [
  { href: '/admin', label: 'Accueil', icon: House },
  { href: '/admin/campaigns', label: 'Campagnes', icon: PanelsTopLeft },
  { href: '/admin/journeys', label: 'Voyages', icon: MapPinned },
  { href: '/admin/leads', label: 'Demandes', icon: Inbox },
] as const;

function isCurrentPath(pathname: string, href: string) {
  if (href === '/admin') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const session = useAdminSession();

  return (
    <div lang="fr" className="min-h-screen bg-[#0d0a07] text-white">
      <a
        href="#admin-content"
        className="fixed left-3 top-3 z-[70] -translate-y-24 bg-[#f4bb52] px-4 py-3 text-sm font-semibold text-black outline-none transition focus:translate-y-0 focus-visible:ring-2 focus-visible:ring-white"
      >
        Aller au contenu
      </a>

      <header className="fixed inset-x-0 top-0 z-[60] border-b border-white/10 bg-[#0d0a07]/95 backdrop-blur-xl">
        <div className="flex min-h-16 items-center justify-between gap-3 px-3 sm:px-6 lg:px-10">
          <Link
            href="/admin"
            className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-sm px-1 outline-none transition focus-visible:ring-2 focus-visible:ring-[#f4bb52]"
            aria-label="Espace Bee — accueil"
          >
            <Image
              src="/assets/icones/Ico Gold BEE-13.svg"
              alt=""
              width={30}
              height={30}
              className="h-7 w-7 shrink-0 object-contain"
            />
            <span className="truncate text-sm font-medium uppercase tracking-[0.18em] sm:text-base">
              Espace Bee
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <span className="hidden max-w-48 truncate text-xs text-white/45 lg:inline">
              {session?.email}
            </span>
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-sm px-2 text-sm text-white/70 outline-none transition hover:bg-white/[0.06] hover:text-[#f4bb52] focus-visible:ring-2 focus-visible:ring-[#f4bb52] sm:px-3"
              aria-label="Voir le site public dans un nouvel onglet"
            >
              <ExternalLink className="size-4" aria-hidden />
              <span className="hidden md:inline">Voir le site</span>
            </Link>
            <button
              type="button"
              onClick={() => void session?.logout()}
              disabled={!session || session.loggingOut}
              className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-sm px-2 text-sm text-white/70 outline-none transition hover:bg-white/[0.06] hover:text-[#f4bb52] focus-visible:ring-2 focus-visible:ring-[#f4bb52] disabled:opacity-45 sm:px-3"
              aria-label="Se déconnecter de l’Espace Bee"
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden xl:inline">
                {session?.loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
              </span>
            </button>
          </div>
        </div>

        <nav
          aria-label="Navigation de l’Espace Bee"
          className="grid grid-cols-4 border-t border-white/[0.06] px-1 sm:px-4 lg:flex lg:justify-center lg:gap-2"
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isCurrentPath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 rounded-sm px-1 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f4bb52] sm:min-h-12 sm:flex-row sm:gap-2 sm:px-3 lg:min-w-32',
                  active
                    ? 'bg-[#f4bb52]/10 text-[#f4bb52]'
                    : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                )}
              >
                <Icon className="size-[1.125rem] shrink-0" aria-hidden />
                <span>{item.label}</span>
                {active ? (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 bg-[#f4bb52]" aria-hidden />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </header>

      <div id="admin-content" tabIndex={-1} className="[&>main]:!pt-40 lg:[&>main]:!pt-36">
        {children}
      </div>
    </div>
  );
}
