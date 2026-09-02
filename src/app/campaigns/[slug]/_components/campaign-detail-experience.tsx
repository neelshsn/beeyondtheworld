'use client';

import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useBodyScrollLock } from '@/app/concept/_hooks/use-body-scroll-lock';
import { usePrefersReducedMotion } from '@/app/concept/_hooks/use-prefers-reduced-motion';
import { SiteArrowIcon } from '@/components/icons/site-arrow-icon';
import { SmartVideo } from '@/components/primitives';
import { CAMPAIGN_FORMAT_BY_ID } from '@/data/campaign-formats';
import type { CampaignShowcase, ShowcaseMedia } from '@/data/showcases';
import { formatCampaignSeason } from '@/lib/format-campaign-season';
import type { Campaign } from '@/types/campaign';

import { CampaignStoryExperience } from './campaign-story-experience';

type MediaFilter = 'all' | 'image' | 'video';
type MediaOption = {
  label: string;
  value: MediaFilter;
  icon: string;
  hoverIcon?: string;
};

const MEDIA_OPTIONS: MediaOption[] = [
  {
    label: 'All Media',
    value: 'all',
    icon: '/assets/icones/Ico White BEE-13.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-13.svg',
  },
  {
    label: 'Photos',
    value: 'image',
    icon: '/assets/icones/Ico White BEE-08.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-08.svg',
  },
  {
    label: 'Videos',
    value: 'video',
    icon: '/assets/icones/Ico White BEE-15.svg',
    hoverIcon: '/assets/icones/Ico Gold BEE-15.svg',
  },
];

const PHOTO_CARD_ICON = '/assets/icones/Ico White BEE-08.svg';
const VIDEO_CARD_ICON = '/assets/icones/Ico White BEE-15.svg';
const OPEN_CARD_ICON = '/assets/icones/Ico White BEE-13.svg';

function getMediaOption(value: MediaFilter) {
  return MEDIA_OPTIONS.find((option) => option.value === value) ?? MEDIA_OPTIONS[0];
}

function getMediaOptionIndex(value: MediaFilter) {
  return MEDIA_OPTIONS.findIndex((option) => option.value === value);
}

function dedupeMedia(items: ShowcaseMedia[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function alternateMedia(items: ShowcaseMedia[]) {
  const videos = items.filter((item) => item.type === 'video');
  const images = items.filter((item) => item.type === 'image');

  if (!videos.length || !images.length) {
    return items;
  }

  const ordered: ShowcaseMedia[] = [];
  let videoIndex = 0;
  let imageIndex = 0;
  let nextType: ShowcaseMedia['type'] = 'video';

  while (videoIndex < videos.length || imageIndex < images.length) {
    if (nextType === 'video') {
      if (videoIndex < videos.length) {
        ordered.push(videos[videoIndex]);
        videoIndex += 1;
      } else if (imageIndex < images.length) {
        ordered.push(images[imageIndex]);
        imageIndex += 1;
      }

      nextType = 'image';
      continue;
    }

    if (imageIndex < images.length) {
      ordered.push(images[imageIndex]);
      imageIndex += 1;
    } else if (videoIndex < videos.length) {
      ordered.push(videos[videoIndex]);
      videoIndex += 1;
    }

    nextType = 'video';
  }

  return ordered;
}

function backgroundFor(campaign: CampaignShowcase, meta: Campaign | null) {
  const landscapeStill =
    campaign.gallery.find((item) => item.type === 'image' && item.aspectRatio === 'landscape') ??
    campaign.gallery.find((item) => item.type === 'image') ??
    (campaign.hero.type === 'image' ? campaign.hero : null);

  if (landscapeStill) {
    return { image: landscapeStill.src, video: undefined };
  }

  if (campaign.hero.type === 'video') {
    return { image: campaign.hero.poster ?? meta?.image ?? '', video: undefined };
  }

  return {
    image: campaign.hero.src,
    video: undefined,
  };
}

function carouselCardAspectClass() {
  return 'aspect-[3/4]';
}

export function CampaignDetailExperience({
  campaign,
  meta,
}: {
  campaign: CampaignShowcase;
  meta: Campaign | null;
}) {
  const format = CAMPAIGN_FORMAT_BY_ID[campaign.id] ?? 'tale';

  return format === 'gallery' ? (
    <CampaignGalleryExperience campaign={campaign} meta={meta} />
  ) : (
    <CampaignStoryExperience campaign={campaign} meta={meta} />
  );
}

export function CampaignGalleryExperience({
  campaign,
  meta,
}: {
  campaign: CampaignShowcase;
  meta: Campaign | null;
}) {
  useBodyScrollLock();

  const prefersReducedMotion = usePrefersReducedMotion();
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [filterDirection, setFilterDirection] = useState(1);
  const [activeMedia, setActiveMedia] = useState<ShowcaseMedia | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const orderedMedia = useMemo(
    () => alternateMedia(dedupeMedia([campaign.hero, ...campaign.gallery])),
    [campaign]
  );

  const media = useMemo(() => {
    if (filter === 'all') return orderedMedia;
    return orderedMedia.filter((item) => item.type === filter);
  }, [filter, orderedMedia]);
  const emblaOptions = useMemo(
    () => ({
      align: 'start' as const,
      containScroll: 'trimSnaps' as const,
      loop: media.length > 1,
    }),
    [media.length]
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.reInit({ ...emblaOptions, startIndex: 0 });
    emblaApi.scrollTo(0, true);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, emblaOptions]);

  const onCardAction = useCallback(
    (item: ShowcaseMedia, index: number) => {
      if (!emblaApi) return setActiveMedia(item);
      if (index !== emblaApi.selectedScrollSnap()) return emblaApi.scrollTo(index);
      setActiveMedia(item);
    },
    [emblaApi]
  );
  const handleFilterCycle = useCallback(
    (direction: 1 | -1) => {
      const currentIndex = getMediaOptionIndex(filter);
      const nextIndex = (currentIndex + direction + MEDIA_OPTIONS.length) % MEDIA_OPTIONS.length;
      const nextFilter = MEDIA_OPTIONS[nextIndex]?.value ?? 'all';

      setFilterDirection(direction);
      setFilter(nextFilter);
    },
    [filter]
  );

  const bg = backgroundFor(campaign, meta);
  const title = meta?.client ?? campaign.title;
  const subtitle = meta?.destination ?? campaign.destination;
  const detail = meta?.releaseWindow
    ? formatCampaignSeason(meta.releaseWindow)
    : (campaign.hero.caption ?? 'Campaign edit');
  const subtitleLine = [subtitle, detail].filter(Boolean).join(' / ');

  return (
    <>
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden border-b border-[#f4bb52]/70 bg-black text-white">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={bg.image}
            alt=""
            fill
            quality={100}
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(18,12,10,0.62)_0%,rgba(25,18,19,0.44)_38%,rgba(8,8,10,0.58)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(214,167,112,0.26)_0%,rgba(214,167,112,0)_44%),radial-gradient(circle_at_86%_24%,rgba(214,225,236,0.12)_0%,rgba(214,225,236,0)_42%)]" />
        </div>

        <div className="pointer-events-none absolute left-4 top-5 z-30 sm:left-6 sm:top-7 md:hidden">
          <Link
            href="/campaigns"
            className="border-white/22 bg-black/22 hover:border-white/42 pointer-events-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.68rem] uppercase tracking-[0.28em] text-white/80 backdrop-blur transition hover:text-white"
          >
            <SiteArrowIcon direction="left" className="h-3.5 w-3.5" />
            All Campaigns
          </Link>
        </div>

        <div className="relative z-20 flex min-h-[100svh] flex-col">
          <div className="relative flex flex-1 items-center justify-end">
            <div className="w-full px-2 pb-2 pt-20 sm:px-6 sm:pb-4 sm:pt-24 md:ml-auto md:w-[75%] md:pb-0 md:pl-10 md:pr-6 md:pt-0 lg:py-10 lg:pl-16 lg:pr-10 xl:pl-20">
              <div
                className="overflow-visible pb-8 sm:pb-10 md:overflow-hidden md:pb-0"
                ref={emblaRef}
              >
                <div className="embla__container flex touch-pan-x items-center gap-3 sm:gap-4 md:gap-[var(--campaign-gap)] md:[--campaign-gap:clamp(14px,1.7vw,28px)]">
                  {media.map((item, index) => (
                    <div
                      key={item.id}
                      className={clsx(
                        'embla__slide flex flex-[0_0_68%] items-center sm:flex-[0_0_58%]',
                        index === selectedIndex
                          ? 'md:flex-[0_0_calc((100%-(var(--campaign-gap)*3))*0.4)]'
                          : 'md:flex-[0_0_calc((100%-(var(--campaign-gap)*3))*0.23)]'
                      )}
                    >
                      <motion.button
                        type="button"
                        onClick={() => onCardAction(item, index)}
                        className="group relative w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d49b]"
                        animate={
                          prefersReducedMotion
                            ? undefined
                            : {
                                opacity: index === selectedIndex ? 1 : 0.76,
                                scale: index === selectedIndex ? 1 : 0.989,
                                y: index === selectedIndex ? 0 : 9,
                              }
                        }
                        whileHover={
                          prefersReducedMotion
                            ? undefined
                            : { y: -4, scale: index === selectedIndex ? 1.01 : 0.995 }
                        }
                        transition={
                          prefersReducedMotion
                            ? undefined
                            : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                        }
                      >
                        <div
                          className={clsx(
                            'relative w-full overflow-hidden shadow-[0_30px_75px_-24px_rgba(0,0,0,0.78)]',
                            carouselCardAspectClass()
                          )}
                        >
                          {item.type === 'image' ? (
                            <Image
                              src={item.src}
                              alt={item.alt}
                              fill
                              quality={100}
                              sizes="(min-width: 1536px) 27vw, (min-width: 1280px) 32vw, (min-width: 1024px) 34vw, (min-width: 640px) 52vw, 78vw"
                              className="object-cover"
                              priority={index === selectedIndex}
                            />
                          ) : (
                            <SmartVideo
                              wrapperClassName="absolute inset-0"
                              className="h-full w-full object-cover"
                              src={item.src}
                              poster={item.poster}
                              fallbackImage={item.poster}
                              autoPlay
                              muted
                              loop
                              playsInline
                              aria-hidden
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-5 pb-5">
                            <span className="relative block h-6 w-6 shrink-0 drop-shadow-[0_0_12px_rgba(255,255,255,0.28)]">
                              <Image
                                src={item.type === 'video' ? VIDEO_CARD_ICON : PHOTO_CARD_ICON}
                                alt=""
                                fill
                                className="object-contain"
                              />
                            </span>
                            <span className="relative block h-6 w-6 shrink-0 drop-shadow-[0_0_12px_rgba(255,255,255,0.28)]">
                              <Image src={OPEN_CARD_ICON} alt="" fill className="object-contain" />
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pointer-events-none relative z-40 mt-8 flex flex-col items-center gap-3 pb-5 md:hidden">
                <p className="text-center font-title text-[clamp(2.15rem,12vw,4.4rem)] uppercase leading-[0.82] text-white">
                  {title}
                </p>
                <p className="text-center text-[0.56rem] uppercase tracking-[0.38em] text-white">
                  {subtitleLine}
                </p>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute left-6 top-1/2 z-40 hidden -translate-y-1/2 md:block lg:left-10 xl:left-14">
            <div className="max-w-[28vw] xl:max-w-[24vw]">
              <h1 className="font-title text-[clamp(3.2rem,7vw,7.4rem)] uppercase leading-[0.82] text-white">
                {title}
              </h1>
              <p className="text-white/84 mt-3 text-[0.6rem] uppercase tracking-[0.38em]">
                {subtitleLine}
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-5 right-4 z-30 hidden sm:bottom-7 sm:right-6 md:right-10 md:block lg:bottom-10 lg:right-16 xl:right-20">
            <MediaDesktopControls
              filter={filter}
              filterDirection={filterDirection}
              prefersReducedMotion={prefersReducedMotion}
              onFilterCycle={handleFilterCycle}
            />
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeMedia ? (
          <motion.div
            className="fixed inset-0 z-[90] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setActiveMedia(null)}
          >
            <button
              type="button"
              onClick={() => setActiveMedia(null)}
              aria-label="Close media"
              className="absolute left-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full text-[rgba(255,240,225,0.8)] transition hover:text-[#f6c452] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c452]/60 focus-visible:ring-offset-0"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <motion.div
              className="relative h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              {activeMedia.type === 'image' ? (
                <Image
                  src={activeMedia.src}
                  alt={activeMedia.alt}
                  fill
                  quality={100}
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              ) : (
                <SmartVideo
                  wrapperClassName="absolute inset-0"
                  className="h-full w-full object-contain"
                  src={activeMedia.src}
                  poster={activeMedia.poster}
                  fallbackImage={activeMedia.poster}
                  controls
                  autoPlay
                  playsInline
                />
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

type MediaElevatorProps = {
  value: MediaFilter;
  direction: number;
  prefersReducedMotion: boolean;
  onCycle: (direction: 1 | -1) => void;
};

function MediaElevator({ value, direction, prefersReducedMotion, onCycle }: MediaElevatorProps) {
  const option = getMediaOption(value);
  const hoverIcon = option.hoverIcon ?? option.icon;
  const [hoveredControl, setHoveredControl] = useState<'prev' | 'next' | 'center' | null>(null);
  const highlightCenter =
    hoveredControl === 'prev' || hoveredControl === 'next' || hoveredControl === 'center';

  return (
    <motion.div
      layout
      className="inline-flex items-center gap-2 text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.38)] sm:gap-3"
      transition={{
        layout: { duration: prefersReducedMotion ? 0.18 : 0.42, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <motion.button
        layout="position"
        type="button"
        onClick={() => onCycle(-1)}
        onMouseEnter={() => setHoveredControl('prev')}
        onMouseLeave={() => setHoveredControl((current) => (current === 'prev' ? null : current))}
        onFocus={() => setHoveredControl('prev')}
        onBlur={() => setHoveredControl((current) => (current === 'prev' ? null : current))}
        className={clsx(
          'flex h-10 w-10 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          hoveredControl === 'prev'
            ? 'text-[#f6c452] drop-shadow-[0_0_10px_rgba(246,196,82,0.42)]'
            : 'text-white/45'
        )}
        aria-label="Previous media filter"
      >
        <SiteArrowIcon direction="left" className="h-3.5 w-3.5" />
      </motion.button>

      <motion.div layout className="relative flex min-w-0 items-center overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={value}
            layout
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? 28 : -28 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? -28 : 28 }
            }
            transition={{
              duration: prefersReducedMotion ? 0.2 : 0.42,
              ease: [0.22, 1, 0.36, 1],
              layout: { duration: prefersReducedMotion ? 0.18 : 0.42, ease: [0.22, 1, 0.36, 1] },
            }}
            onMouseEnter={() => setHoveredControl('center')}
            onMouseLeave={() =>
              setHoveredControl((current) => (current === 'center' ? null : current))
            }
            className="group/season relative flex items-center gap-2.5 sm:gap-3"
          >
            <div className="relative h-8 w-8 shrink-0 sm:h-9 sm:w-9">
              <Image
                src={option.icon}
                alt=""
                fill
                className={clsx(
                  'object-contain transition-opacity duration-300',
                  option.hoverIcon && highlightCenter ? 'opacity-0' : 'opacity-100'
                )}
                priority
              />
              {hoverIcon ? (
                <Image
                  src={hoverIcon}
                  alt=""
                  fill
                  className={clsx(
                    'object-contain transition-opacity duration-300',
                    highlightCenter ? 'opacity-100' : 'opacity-0'
                  )}
                />
              ) : null}
            </div>

            <span
              className={clsx(
                'whitespace-nowrap font-display text-[0.92rem] uppercase tracking-[0.12em] transition-colors duration-300 [text-shadow:0_0_12px_rgba(255,255,255,0.34),0_12px_28px_rgba(0,0,0,0.34),0_24px_56px_rgba(0,0,0,0.22)] sm:text-[1.24rem]',
                highlightCenter ? 'text-[#f6c452]' : 'text-white'
              )}
            >
              {option.label}
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.button
        layout="position"
        type="button"
        onClick={() => onCycle(1)}
        onMouseEnter={() => setHoveredControl('next')}
        onMouseLeave={() => setHoveredControl((current) => (current === 'next' ? null : current))}
        onFocus={() => setHoveredControl('next')}
        onBlur={() => setHoveredControl((current) => (current === 'next' ? null : current))}
        className={clsx(
          'flex h-6 w-6 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          hoveredControl === 'next'
            ? 'text-[#f6c452] drop-shadow-[0_0_10px_rgba(246,196,82,0.42)]'
            : 'text-white/45'
        )}
        aria-label="Next media filter"
      >
        <SiteArrowIcon direction="right" className="h-3.5 w-3.5" />
      </motion.button>
    </motion.div>
  );
}

type MediaDesktopControlsProps = {
  filter: MediaFilter;
  filterDirection: number;
  prefersReducedMotion: boolean;
  onFilterCycle: (direction: 1 | -1) => void;
};

function MediaDesktopControls({
  filter,
  filterDirection,
  prefersReducedMotion,
  onFilterCycle,
}: MediaDesktopControlsProps) {
  return (
    <div className="pointer-events-auto flex items-center text-white">
      <MediaElevator
        value={filter}
        direction={filterDirection}
        prefersReducedMotion={prefersReducedMotion}
        onCycle={onFilterCycle}
      />
    </div>
  );
}
