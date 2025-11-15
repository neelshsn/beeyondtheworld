'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, PlayCircle, X } from 'lucide-react';
import * as React from 'react';

import { MenuLinks } from '@/components/nav/MenuLinks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { quickLinks } from '@/config/quick-links';
import { socialLinks } from '@/config/socials';

const triggerClasses =
  'group relative flex h-11 items-center rounded-none border border-white/35 bg-white/10 px-4 text-sm font-menu font-semibold uppercase tracking-[0.32em] text-white transition hover:border-white/60 hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-0';

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
        <Button variant="ghost" aria-label="Open menu" className={triggerClasses}>
          <Menu className="h-5 w-5" aria-hidden />
          <span className="sr-only">Menu</span>
          <span className="ml-0 max-w-0 overflow-hidden font-menu text-[11px] uppercase tracking-[0.32em] opacity-0 transition-all duration-200 ease-out group-hover:ml-2 group-hover:max-w-[140px] group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-[140px] group-focus-visible:opacity-100">
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
          <div className="flex h-full flex-col">
            <div className="flex justify-end">
              <SheetClose asChild>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="flex h-11 w-11 items-center justify-center rounded-none border border-[rgba(235,180,80,0.45)] bg-[rgba(46,30,19,0.45)] text-[rgba(255,240,225,0.86)] transition hover:border-[rgba(244,199,122,0.75)] hover:bg-[rgba(70,46,29,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,199,122,0.85)] focus-visible:ring-offset-0"
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
                    <p className="font-display text-xs uppercase tracking-[0.35em] text-[rgba(255,214,166,0.62)]">
                      Quick links
                    </p>
                    <p className="text-sm text-[rgba(255,236,216,0.7)]">
                      Experiences we recommend starting with this season.
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {quickLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch
                        onClick={handleNavigate}
                        className="group relative isolate flex min-h-[320px] overflow-hidden border border-[rgba(255,228,196,0.22)] bg-[rgba(255,238,220,0.04)] text-[rgba(255,240,225,0.92)] shadow-[0_35px_120px_-60px_rgba(0,0,0,0.65)] transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,199,122,0.85)] focus-visible:ring-offset-0"
                      >
                        <div className="absolute inset-0">
                          <div
                            className="absolute inset-0 scale-105 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${item.mediaUrl})` }}
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(21,14,10,0.72)_0%,rgba(44,28,18,0.4)_45%,rgba(101,64,36,0.78)_100%)]" />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,222,190,0.42),transparent_62%),radial-gradient(circle_at_82%_8%,rgba(244,199,122,0.38),transparent_68%)] opacity-80 mix-blend-screen" />
                        </div>
                        <div className="relative z-10 flex w-full flex-col justify-between px-6 py-7">
                          <div className="space-y-4">
                            <span className="font-display text-[11px] uppercase tracking-[0.32em] text-[rgba(255,222,190,0.72)]">
                              {item.badge}
                            </span>
                            <h3 className="font-title text-2xl uppercase tracking-[0em] text-[rgba(255,246,232,0.98)] drop-shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
                              {item.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-[rgba(255,235,210,0.78)]">
                              {item.description}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.38em] text-[rgba(255,226,194,0.7)] transition group-hover:text-[rgba(255,246,232,0.95)]">
                            Explore
                            <ArrowUpRight
                              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-[1px] group-hover:translate-x-[4px]"
                              aria-hidden
                            />
                          </span>
                        </div>
                        <PlayCircle
                          className="pointer-events-none absolute right-6 top-6 h-8 w-8 text-[rgba(255,248,236,0.85)] opacity-0 drop-shadow-xl transition duration-300 group-hover:opacity-100"
                          aria-hidden
                        />
                      </Link>
                    ))}
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
                      className="flex h-14 w-14 items-center justify-center rounded-none border border-[rgba(235,180,80,0.45)] bg-[rgba(44,30,20,0.55)] text-[rgba(255,240,225,0.92)] transition hover:border-[rgba(244,199,122,0.75)] hover:bg-[rgba(66,43,28,0.68)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(244,199,122,0.85)] focus-visible:ring-offset-0"
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
