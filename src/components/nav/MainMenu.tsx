'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import * as React from 'react';

import { MenuLinks } from '@/components/nav/MenuLinks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { socialLinks } from '@/config/socials';
import { journeyShowcases } from '@/data/showcases';
import { cn } from '@/lib/utils';

const triggerClasses =
  'group relative flex h-11 min-w-[44px] items-center justify-center rounded-full bg-white/10 px-5 text-sm font-sans font-semibold uppercase tracking-[0.32em] text-white/90 transition hover:bg-[rgba(244,199,122,0.3)] focus-visible:ring-2 focus-visible:ring-[#f6c452]/45 focus-visible:ring-offset-0 backdrop-blur-lg';

export function MainMenu() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);
  const lastPathnameRef = React.useRef(pathname);
  const heroJourney =
    journeyShowcases.find((journey) => journey.id === 'philippines') ?? journeyShowcases[0];
  const springSummerJourney =
    journeyShowcases.find((journey) => journey.id === 'mallorca') ?? journeyShowcases[1];

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  React.useEffect(() => {
    if (!hasMounted) return;
    if (pathname !== lastPathnameRef.current) {
      lastPathnameRef.current = pathname;
      setOpen(false);
    }
  }, [pathname, hasMounted]);

  const handleNavigate = React.useCallback(() => {
    setOpen(false);
  }, []);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" aria-label="Open menu" className={triggerClasses}>
          <Menu className="h-5 w-5" aria-hidden />
          <span className="sr-only">Menu</span>
          <span className="ml-0 max-w-0 overflow-hidden font-sans text-[11px] uppercase tracking-[0.32em] text-white/90 opacity-0 transition-all duration-200 ease-out group-hover:ml-2 group-hover:max-w-[140px] group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-[140px] group-focus-visible:opacity-100">
            Menu
          </span>
        </Button>
      </SheetTrigger>
      {hasMounted ? (
        <SheetContent
          side="right"
          aria-label="Primary navigation"
          className="w-[88vw] max-w-[760px] border-l border-[rgba(255,210,170,0.28)] bg-[linear-gradient(137deg,rgba(20,12,8,0.82)_0%,rgba(45,28,18,0.78)_42%,rgba(86,47,24,0.8)_100%)] px-8 pb-12 pt-14 font-menu text-[rgba(255,240,225,0.92)] shadow-[0_45px_160px_-70px_rgba(16,10,6,0.9)] backdrop-blur-2xl sm:w-[70vw] md:px-14 lg:w-[55vw] xl:w-[50vw]"
        >
          <SheetTitle className="sr-only">Primary navigation</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex justify-end">
              <SheetClose asChild>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[rgba(255,240,225,0.8)] transition hover:text-[#f6c452] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c452]/60 focus-visible:ring-offset-0"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </SheetClose>
            </div>
            <ScrollArea className="mt-10 flex-1">
              <div className="flex min-h-full flex-col pb-12">
                <MenuLinks isOpen={open} onNavigate={handleNavigate} />
                <Separator className="my-12 border-[rgba(255,214,166,0.25)]" />
                <section className="flex flex-col gap-8">
                  <div className="space-y-2">
                    <p className="font-display text-xs uppercase tracking-[0em] text-[rgba(255,214,166,0.62)]">
                      Quick links
                    </p>
                    <p className="text-sm text-[rgba(255,236,216,0.7)]">
                      Experiences we recommend starting with this season.
                    </p>
                  </div>
                  <div className="flex flex-col gap-0 overflow-hidden">
                    <div className="grid gap-0 md:grid-cols-2">
                      {[
                        {
                          id: 'next-journey',
                          href: `/journeys/${heroJourney.slug}`,
                          label: heroJourney.locale,
                          meta: heroJourney.timeframe,
                          title: heroJourney.title,
                          description: heroJourney.summary,
                          image: heroJourney.hero.src,
                          layout: 'portrait' as const,
                        },
                        {
                          id: 'spring-summer',
                          href: '/journeys?season=summer',
                          label: 'Spring Summer catalogue',
                          meta: 'Spring Summer 26',
                          title: springSummerJourney.title,
                          description:
                            'Partez pour les ateliers ensoleillés sélectionnés pour la saison Spring Summer. Le catalogue se charge déjà filtré.',
                          image: springSummerJourney.hero.src,
                          layout: 'portrait' as const,
                        },
                      ].map((tile, index) => (
                        <MenuQuickLink
                          key={tile.id}
                          tile={tile}
                          onNavigate={handleNavigate}
                          className={cn(
                            'border border-white/10',
                            index === 0 && 'md:border-r-0',
                            index === 1 && 'md:border-l-0'
                          )}
                        />
                      ))}
                    </div>
                    <MenuQuickLink
                      tile={{
                        id: 'csr-label',
                        href: '/concept',
                        label: 'CSR Label',
                        meta: 'Impact guardianship',
                        title: 'La signature Beeyondtheworld',
                        description:
                          'Découvrez comment notre label CSR certifie les engagements climat et sociétaux de chaque voyage, du plateau aux communautés locales.',
                        image: '/assets/concept/sustainable-poster.png',
                        layout: 'landscape',
                      }}
                      onNavigate={handleNavigate}
                      className="border border-t-0 border-white/10"
                    />
                  </div>
                </section>
                <Separator className="my-12 border-[rgba(255,214,166,0.25)]" />
                <div className="mt-auto flex items-center gap-5">
                  {socialLinks.map(({ href, label, icon: Icon }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener"
                      aria-label={label}
                      className="flex h-14 w-14 items-center justify-center rounded-full text-[rgba(255,240,225,0.8)] transition hover:text-[#f6c452] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c452]/60 focus-visible:ring-offset-0"
                    >
                      <Icon className="h-6 w-6" aria-hidden />
                    </a>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      ) : null}
    </Sheet>
  );
}

type MenuQuickLinkTile = {
  id: string;
  href: string;
  label: string;
  meta: string;
  title: string;
  description: string;
  image: string;
  layout: 'portrait' | 'landscape';
};

function MenuQuickLink({
  tile,
  onNavigate,
  className,
}: {
  tile: MenuQuickLinkTile;
  onNavigate: () => void;
  className?: string;
}) {
  const aspectClass =
    tile.layout === 'landscape' ? 'md:aspect-[6/3]' : 'md:aspect-[2/3] md:min-h-[440px]';

  return (
    <Link
      href={tile.href}
      prefetch
      onClick={onNavigate}
      className={cn(
        'group relative isolate flex min-h-[320px] overflow-hidden rounded-none bg-white/5 text-white shadow-[0_35px_120px_rgba(0,0,0,0.55)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c452]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        aspectClass,
        className
      )}
      aria-label={tile.title}
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${tile.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent transition duration-500 group-hover:from-[rgba(32,22,18,0.92)] group-hover:via-black/45" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-40" />
      </div>
      <div className="relative z-10 flex h-full w-full flex-col justify-between p-6 sm:p-8">
        <div className="space-y-1 text-[10px] uppercase tracking-[0.45em] text-white/70">
          <p>{tile.label}</p>
          <p className="text-[0.62rem] tracking-[0.38em] text-white/60">{tile.meta}</p>
        </div>
        <div className="space-y-4 text-left">
          <h3 className="font-title text-3xl uppercase tracking-[0.1em] text-white sm:text-4xl">
            {tile.title}
          </h3>
          <p className="text-sm leading-relaxed text-white/85 opacity-0 transition duration-300 group-hover:opacity-100">
            {tile.description}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.45em] text-white/80">
          <span>Discover</span>
          <ArrowUpRight
            className="h-4 w-4 transition duration-300 group-hover:-translate-y-[1px] group-hover:translate-x-[4px]"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
