'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { MenuLinks } from '@/components/nav/MenuLinks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { socialLinks } from '@/config/socials';
import { cn } from '@/lib/utils';

export function MainMenu() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);
  const lastPathnameRef = React.useRef(pathname);

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
        <button
          type="button"
          aria-label="Open menu"
          className="group inline-flex min-h-[44px] flex-col items-start justify-center focus-visible:outline-none"
        >
          <span className="inline-flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.4em] text-white">
            <Image
              src="/assets/icones/feedbacks/site-navigation.svg"
              alt=""
              width={22}
              height={22}
              className="h-[1.15rem] w-[1.15rem] object-contain"
              aria-hidden
            />
            <span>Menu</span>
          </span>
          <span
            aria-hidden
            className="mt-1.5 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[rgba(249,215,162,0.18)] via-[rgba(244,199,122,0.75)] to-[rgba(255,240,225,0.95)] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
          />
        </button>
      </SheetTrigger>
      {hasMounted ? (
        <SheetContent
          side="right"
          aria-label="Primary navigation"
          className="w-[96vw] max-w-[836px] border-l border-[rgba(255,210,170,0.28)] bg-[linear-gradient(137deg,rgba(20,12,8,0.82)_0%,rgba(45,28,18,0.78)_42%,rgba(86,47,24,0.8)_100%)] px-8 pb-12 pt-14 font-menu text-[rgba(255,240,225,0.92)] shadow-[0_45px_160px_-70px_rgba(16,10,6,0.9)] backdrop-blur-2xl sm:w-[77vw] md:px-14 lg:w-[60vw] xl:w-[55vw]"
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
                <section className="mt-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-0 overflow-hidden">
                    <div className="grid gap-0 md:grid-cols-2">
                      {[
                        {
                          id: 'india-focus',
                          href: '/journeys/india-january-2026',
                          label: '',
                          meta: '',
                          title: '',
                          image:
                            '/assets/journeys/india-january-2026/india-january-2026-gallery-03.png',
                          layout: 'portrait' as const,
                          cta: 'INDIA JANUARY 26',
                        },
                        {
                          id: 'spring-summer',
                          href: '/journeys?season=summer',
                          label: '',
                          meta: '',
                          title: '',
                          image:
                            '/assets/journeys/morocco-april-2026/morocco-april-2026-gallery-07.png',
                          layout: 'portrait' as const,
                          cta: 'SPRING SUMMER',
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
                        label: '',
                        meta: '',
                        title: '',
                        image: '/assets/campaigns/craie-suisse/swiss3.jpg',
                        layout: 'landscape',
                        cta: 'CSR LABEL',
                      }}
                      onNavigate={handleNavigate}
                      className="border border-t-0 border-white/10"
                    />
                  </div>
                </section>
                <div className="mt-auto flex items-center gap-5">
                  {socialLinks.map(({ href, label, icon: Icon }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener"
                      aria-label={label}
                      className="flex h-16 w-16 items-center justify-center text-[rgba(255,240,225,0.9)] transition hover:text-[#f6c452] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c452]/60 focus-visible:ring-offset-0"
                    >
                      <Icon
                        className="h-8 w-8 drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]"
                        aria-hidden
                      />
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
  image: string;
  layout: 'portrait' | 'landscape';
  cta?: string;
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
  const ariaLabel = [tile.label, tile.meta].filter(Boolean).join(' - ') || 'Quick link';
  const displayTitle = tile.title?.trim() ? tile.title : '\u00A0';
  const hasHeader = Boolean(tile.label || tile.meta);
  const ctaLabel = tile.cta?.trim() || 'Discover';
  const aspectClass =
    tile.layout === 'landscape'
      ? 'md:aspect-[5/3] md:min-h-[420px]'
      : 'md:aspect-[2/3] md:min-h-[440px]';

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
      aria-label={ariaLabel}
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${tile.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(9,6,4,0.92)] via-black/35 to-transparent transition duration-500 group-hover:from-[rgba(26,18,13,0.95)] group-hover:via-black/45" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-40" />
      </div>
      <div className="relative z-10 flex min-h-[inherit] w-full flex-col gap-6 self-stretch p-6 sm:p-8">
        {hasHeader ? (
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-white/70">
            <span className="pr-4">{tile.label}</span>
            <span className="text-[0.64rem] tracking-[0.3em] text-white/60">{tile.meta}</span>
          </div>
        ) : null}
        <div className="flex flex-1 items-center">
          <h3 className="w-full text-center font-title text-2xl uppercase tracking-[0em] text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:text-3xl lg:text-[32px]">
            {displayTitle}
          </h3>
        </div>
        <div className="mt-auto flex items-center justify-center gap-2 font-display text-[10px] uppercase tracking-[0.4em] text-white">
          <span className="leading-none">{ctaLabel}</span>
        </div>
      </div>
    </Link>
  );
}
