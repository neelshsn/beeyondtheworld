'use client';

import { gsap } from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBodyScrollLock } from '@/app/concept/_hooks/use-body-scroll-lock';
import { SmartVideo } from '@/components/primitives';
import { campaignShowcases, type CampaignShowcase } from '@/data/showcases';
import { formatCampaignSeason } from '@/lib/format-campaign-season';
import type { Campaign } from '@/types/campaign';

type StoryCopy = { title: string; body: string };
type MediaOverride = {
  heroVideo?: string;
  storyVideo?: string;
  videos?: string[];
  images?: string[];
};
type StoryMediaPanel = { type: 'image' | 'video'; src: string };

const STORY_COPY: Record<string, StoryCopy> = {
  'maradji-ibiza': {
    title: 'Salt remembers the sun',
    body: 'THERE IS AN ISLAND WHERE SUMMER NEVER COMPLETELY LEAVES. SALT RESTS ON THE SKIN, PINE TREES BEND TOWARD THE SEA, AND EVERY BREEZE CARRIES A MEMORY OF LIGHT. BETWEEN HIDDEN CALAS AND TERRACOTTA ROOFTOPS, EACH SILHOUETTE BECOMES PART OF THE LANDSCAPE. STRAW, SILK AND SHELL MOVE WITH THE WIND, NEVER AGAINST IT. THE DAY OPENS IN TURQUOISE, WARMS INTO GOLD, THEN CLOSES AROUND A BEACH FIRE. WHAT REMAINS IS NOT A POSE, BUT A RITUAL: THE QUIET ART OF CARRYING SUMMER WITH YOU.',
  },
  'almaaz-kenya': {
    title: 'Where every bloom belongs',
    body: 'ON THE KENYAN COAST, LIGHT DOES MORE THAN REVEAL A FACE. IT REVEALS A STORY, A CULTURE AND A TALENT THAT DESERVES TO TRAVEL BEYOND EVERY BORDER. VERA ENTERS THE FRAME WITH HER OWN RHYTHM, HER OWN IDENTITY AND THE QUIET STRENGTH OF MOMBASA. JEWELLERY BECOMES A LANGUAGE OF CONNECTION, LINKING LOCAL CREATIVITY TO AN INTERNATIONAL AUDIENCE. NOTHING IS BORROWED OR DISGUISED. EVERYTHING BEGINS WITH A GENUINE ENCOUNTER. WHEN EVERY BLOOM IS GIVEN SPACE TO EXIST, INCLUSIVITY IS NO LONGER A PROMISE. IT BECOMES VISIBLE.',
  },
  'craie-maroc': {
    title: 'The poetry of contrasts',
    body: 'IN MOROCCO, A FEW KILOMETRES CAN OPEN THE DOOR TO ANOTHER WORLD. STONE GIVES WAY TO SAND, SHADOW TO BRILLIANT LIGHT, SILENCE TO THE PULSE OF A MEDINA. EACH ROAD BECOMES A NEW CHAPTER, YET THE SAME CREATIVE THREAD PASSES THROUGH THEM ALL. LEATHER, COLOUR AND MOVEMENT FIND A DIFFERENT VOICE IN EVERY LANDSCAPE. THE CAMPAIGN DOES NOT ASK THESE CONTRASTS TO DISAPPEAR. IT LETS THEM SPEAK TO ONE ANOTHER. DISTANCE FADES, DISCOVERY TAKES ITS PLACE, AND ONE COUNTRY BECOMES AN ENDLESS JOURNEY.',
  },
  'craie-suisse': {
    title: 'Blooming snowflakes',
    body: 'ONE LANDSCAPE CAN HOLD A THOUSAND AWAKENINGS. IN SWITZERLAND, THE SAME HORIZON CHANGES ITS LANGUAGE WITH EVERY SEASON. BLOOMS RISE THROUGH SOFT LIGHT, THEN SNOWFLAKES REDRAW THE SILENCE. NOTHING STANDS STILL, YET NOTHING LOSES ITS ESSENCE. COLOUR, TEXTURE AND ATMOSPHERE FOLLOW THE SLOW MOVEMENT OF TIME, TURNING A FAMILIAR PLACE INTO A LIVING PAINTING. BY RETURNING TO THE SAME LAND, THE STORY REVEALS THAT TRANSFORMATION DOES NOT ERASE IDENTITY. IT DEEPENS IT, ONE PASSING MOMENT AT A TIME.',
  },
  'grace-mila-morocco': {
    title: 'From warm fall to solstice summer',
    body: 'THE SAME MOROCCAN LIGHT CAN TELL TWO DIFFERENT STORIES. IN FALL, IT MOVES SLOWLY ACROSS WARM TONES, SOFT COASTLINES AND SILHOUETTES AT REST. IN SUMMER, IT OPENS THE HORIZON, LIFTING COLOUR AND MOVEMENT INTO A BRIGHTER RHYTHM. THE SEASONS DO NOT COMPETE. THEY ANSWER ONE ANOTHER. EVERY FRAME PRESERVES THE MEMORY OF THE FIRST CHAPTER WHILE MAKING SPACE FOR THE NEXT. THROUGH ONE DESTINATION, TWO COLLECTIONS FIND A SHARED LANGUAGE OF LIGHT, NATURAL ELEGANCE AND TIME.',
  },
  'veganboost-greece': {
    title: 'Memory of the moon',
    body: 'THERE IS AN ISLAND WHERE THE MOON WHISPERS NATURE’S SECRETS. IT IS THROUGH OBSCURITY THAT LIGHT REVEALS ITSELF. AT DAWN, IT LEAVES BEHIND ITS MOST PRECIOUS MEMORIES, WHERE THE SKY MELTS INTO THE SEA UNTIL THE HORIZON FADES AWAY. A LIVING WORK OF ART, SARAKINIKO BECOMES A CANVAS SCULPTED BY THE ELEMENTS. UPON ITS LUNAR LANDSCAPE, EVERY STRAND WEAVES ITS OWN TALE—A TALE OF THE SEASONS, OF JOURNEYS, OF EMOTIONS, AND OF TIME. LIKE THE CLIFFS SHAPED BY THE WIND AND THE SEA, HAIR EMBRACES EVERY ELEMENT THAT TOUCHES IT. NEVER LOSING ITS ESSENCE, ONLY REVEALING ITS TRUE NATURE. BECAUSE THE MOST BEAUTIFUL STORIES ARE NOT WRITTEN. THEY ARE LIVED.',
  },
  'almaaz-new-york': {
    title: 'Two silhouettes, one skyline',
    body: 'NEW YORK NEVER STOPS MOVING, YET A SILHOUETTE CAN STILL HOLD THE CITY FOR A MOMENT. ABOVE THE STREETS, BLUE AND CREAM MEET STEEL, GLASS AND AN OPEN SKY. TWO WOMEN ENTER THE SAME FRAME WITH DISTINCT PRESENCE, CREATING A DIALOGUE BETWEEN INDIVIDUALITY AND CONNECTION. THE CAMERA MOVES FROM THE SCALE OF THE SKYLINE TO THE INTIMACY OF A GESTURE, KEEPING THE COLLECTION AT THE HEART OF EVERY PERSPECTIVE. THE CITY BECOMES MORE THAN A BACKDROP. IT BECOMES THE THIRD CHARACTER IN A STORY BUILT THROUGH RHYTHM, COLOUR AND MOTION.',
  },
  'ange-new-york': {
    title: 'The power of parallel',
    body: 'SOME STORIES BEGIN NOT WITH THE SAME AUDIENCE, BUT WITH THE SAME VISION. IN NEW YORK, TWO DISTINCT BRANDS MOVE THROUGH ONE PRODUCTION TOWARD A SHARED DESTINATION. EVERY JOURNEY, RESOURCE AND MOMENT ON SET GAINS A GREATER PURPOSE, WHILE EACH CREATIVE IDENTITY REMAINS INTACT. AN’GE KEEPS ITS URBAN, EFFORTLESS VOICE AS THE CITY REFLECTS IT BACK THROUGH TAXI WINDOWS, CROSSWALKS AND QUIET INTERIORS. PARALLEL DOES NOT MEAN IDENTICAL. IT MEANS MOVING TOGETHER, INTELLIGENTLY, WITHOUT LOSING WHAT MAKES EACH STORY ITS OWN.',
  },
};

const MEDIA_OVERRIDES: Record<string, MediaOverride> = {
  'maradji-ibiza': {
    images: [
      '/assets/campaigns/maradji-ibiza/maradji-ibiza-gallery-01.jpg',
      '/assets/campaigns/maradji-ibiza/maradji-ibiza-gallery-02.jpg',
      '/assets/campaigns/maradji-ibiza/maradji-ibiza-gallery-03.jpg',
      '/assets/campaigns/maradji-ibiza/maradji-ibiza-lookbook.jpg',
      '/assets/campaigns/maradji-ibiza/maradji-ibiza-carousel-04.jpg',
    ],
  },
  'craie-maroc': {
    videos: [
      '/assets/campaigns/craie-maroc/craie-maroc-story-01.mp4',
      '/assets/campaigns/craie-maroc/craie-maroc-story-04.mp4',
    ],
    images: [
      '/assets/campaigns/craie-maroc/craie-maroc-carousel-01.jpg',
      '/assets/campaigns/craie-maroc/craie-maroc-gallery-03.jpg',
      '/assets/campaigns/craie-maroc/craie-maroc-gallery-04.jpg',
      '/assets/campaigns/craie-maroc/craie-maroc-gallery-05.jpg',
      '/assets/campaigns/craie-maroc/craie-maroc-gallery-06.jpg',
    ],
  },
  'craie-suisse': {
    heroVideo: '/assets/campaigns/craie-suisse/craie-suisse-story.mp4',
    storyVideo: '/assets/campaigns/craie-suisse/craie-suisse-story.mp4',
    images: ['/assets/campaigns/craie-suisse/swiss3.jpg'],
  },
  'grace-mila-morocco': {
    heroVideo: '/assets/campaigns/grace-mila-morocco/grace-mila-morocco-story.mp4',
    storyVideo: '/assets/campaigns/grace-mila-morocco/grace-mila-morocco-story.mp4',
    images: [
      '/assets/campaigns/grace-mila-morocco/grace-mila-morocco-gallery-01.webp',
      '/assets/campaigns/grace-mila-morocco/grace-mila-morocco-gallery-02.webp',
      '/assets/campaigns/grace-mila-morocco/grace-mila-morocco-cover.webp',
    ],
  },
  'veganboost-greece': {
    heroVideo: '/assets/campaigns/veganboost-greece/veganboost-greece-hero.mp4',
    storyVideo: '/assets/campaigns/veganboost-greece/veganboost-greece-story.mp4',
    images: [
      '/assets/campaigns/veganboost-greece/veganboost-greece-picture-02.webp',
      '/assets/campaigns/veganboost-greece/veganboost-greece-gallery-02.webp',
      '/assets/campaigns/veganboost-greece/veganboost-greece-editorial-01.webp',
      '/assets/campaigns/veganboost-greece/veganboost-greece-editorial-02.webp',
      '/assets/campaigns/veganboost-greece/veganboost-greece-gallery-01.webp',
    ],
  },
};

function unique(items: Array<string | undefined>) {
  return items.filter(
    (item, index, all): item is string => Boolean(item) && all.indexOf(item) === index
  );
}

function resolveMedia(campaign: CampaignShowcase) {
  const override = MEDIA_OVERRIDES[campaign.slug] ?? {};
  const derivedVideos = unique([
    campaign.hero.type === 'video' ? campaign.hero.src : undefined,
    ...campaign.gallery.map((item) => (item.type === 'video' ? item.src : undefined)),
  ]);
  const galleryImages = unique([
    ...campaign.gallery.map((item) => (item.type === 'image' ? item.src : undefined)),
  ]);
  const fallbackImage =
    campaign.hero.type === 'image' ? campaign.hero.src : campaign.hero.poster;
  const images = unique([...(override.images ?? []), ...galleryImages]);
  const resolvedImages = (images.length ? images : unique([fallbackImage])).slice(0, 5);
  const videos = unique([
    override.heroVideo,
    ...derivedVideos,
    override.storyVideo,
    ...(override.videos ?? []),
  ]).slice(0, 5);

  return {
    heroVideo: override.heroVideo ?? videos[0],
    storyVideo: override.storyVideo ?? videos[1] ?? videos[0],
    videos,
    images: resolvedImages.length ? resolvedImages : ['/assets/home/kenya-transition.jpg'],
  };
}

function alternateMedia(images: string[], videos: string[]): StoryMediaPanel[] {
  const panels: StoryMediaPanel[] = [];
  let imageIndex = 0;
  let videoIndex = 0;

  while (imageIndex < images.length || videoIndex < videos.length) {
    if (imageIndex < images.length) {
      panels.push({ type: 'image', src: images[imageIndex] });
      imageIndex += 1;
    }

    if (videoIndex < videos.length) {
      panels.push({ type: 'video', src: videos[videoIndex] });
      videoIndex += 1;
    }
  }

  return panels;
}

export function CampaignStoryExperience({
  campaign,
  meta,
}: {
  campaign: CampaignShowcase;
  meta: Campaign | null;
}) {
  useBodyScrollLock();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(0);
  const animatingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const media = useMemo(() => resolveMedia(campaign), [campaign]);
  const copy = STORY_COPY[campaign.slug] ?? {
    title: campaign.headline,
    body: campaign.summary.toUpperCase(),
  };
  const campaignIndex = campaignShowcases.findIndex((item) => item.slug === campaign.slug);
  const nextCampaign =
    campaignShowcases[(campaignIndex + 1) % campaignShowcases.length] ?? campaignShowcases[0];
  const nextMedia = resolveMedia(nextCampaign);
  const client = meta?.client ?? campaign.title.split(' - ')[0] ?? campaign.title;
  const detail = formatCampaignSeason(
    meta?.releaseWindow ?? campaign.hero.caption ?? campaign.destination
  );
  const additionalMedia = useMemo(() => {
    const remainingImages = media.images.slice(1);
    const remainingVideos = media.videos.filter(
      (video) => video !== media.heroVideo && video !== media.storyVideo
    );

    return alternateMedia(remainingImages, remainingVideos);
  }, [media]);
  const panelCount = 4 + additionalMedia.length;

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= panelCount || index === activeRef.current || animatingRef.current)
        return;
      const container = containerRef.current;
      if (!container) return;
      const panels = container.querySelectorAll<HTMLElement>('[data-story-panel]');
      const current = panels[activeRef.current];
      const incoming = panels[index];
      if (!current || !incoming) return;

      animatingRef.current = true;
      const forward = index > activeRef.current;
      if (forward) {
        gsap.set(incoming, { visibility: 'visible', clipPath: 'inset(100% 0 0 0)' });
        gsap.to(incoming, {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.05,
          ease: 'power3.inOut',
          onComplete: () => {
            gsap.set(current, { visibility: 'hidden' });
            activeRef.current = index;
            setActiveIndex(index);
            animatingRef.current = false;
          },
        });
        return;
      }

      gsap.set(incoming, { visibility: 'visible', clipPath: 'inset(0% 0 0 0)' });
      gsap.to(current, {
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.05,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.set(current, { visibility: 'hidden', clipPath: 'inset(0% 0 0 0)' });
          activeRef.current = index;
          setActiveIndex(index);
          animatingRef.current = false;
        },
      });
    },
    [panelCount]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const panels = container.querySelectorAll<HTMLElement>('[data-story-panel]');
    activeRef.current = 0;
    animatingRef.current = false;
    setActiveIndex(0);
    panels.forEach((panel, index) => {
      gsap.set(panel, {
        visibility: index === 0 ? 'visible' : 'hidden',
        clipPath: 'inset(0% 0 0 0)',
      });
    });

    let wheelDelta = 0;
    let touchStart = 0;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (animatingRef.current) return;
      wheelDelta += event.deltaY;
      if (Math.abs(wheelDelta) < 55) return;
      const direction = wheelDelta > 0 ? 1 : -1;
      wheelDelta = 0;
      goTo(activeRef.current + direction);
    };
    const onTouchStart = (event: TouchEvent) => {
      touchStart = event.touches[0]?.clientY ?? 0;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const delta = touchStart - (event.changedTouches[0]?.clientY ?? 0);
      if (Math.abs(delta) > 40) goTo(activeRef.current + (delta > 0 ? 1 : -1));
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        goTo(activeRef.current + 1);
      }
      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        goTo(activeRef.current - 1);
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [campaign.slug, goTo]);

  return (
    <main ref={containerRef} className="relative h-[100svh] overflow-hidden bg-black text-white">
      <section
        data-story-panel
        className="absolute inset-0 overflow-hidden bg-black"
        style={{ zIndex: 1 }}
      >
        <MediaBackground video={media.heroVideo} image={media.images[0]} priority />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,3,0.12)_0%,rgba(4,4,3,0.02)_46%,rgba(4,4,3,0.72)_100%)]" />
        <div className="absolute bottom-10 left-6 z-10 max-w-[90vw] text-left sm:bottom-14 sm:left-12 lg:bottom-20 lg:left-20">
          <h1 className="font-title text-[clamp(3.5rem,10vw,10rem)] uppercase leading-[0.76] tracking-[-0.025em] text-white [text-shadow:0_14px_55px_rgba(0,0,0,0.52)]">
            {client}
          </h1>
          <p className="mt-4 font-display text-[0.56rem] uppercase tracking-[0.34em] text-white/90 sm:text-[0.7rem]">
            {campaign.destination} <span className="px-2 text-[#f6c452]">|</span> {detail}
          </p>
        </div>
      </section>

      <section
        data-story-panel
        className="absolute inset-0 overflow-hidden bg-black"
        style={{ zIndex: 2 }}
      >
        <Image
          src={media.images[0]}
          alt={campaign.hero.alt}
          fill
          quality={100}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20" />
      </section>

      <section
        data-story-panel
        className="absolute inset-0 overflow-hidden bg-black"
        style={{ zIndex: 3 }}
      >
        <MediaBackground video={media.storyVideo} image={media.images[1] ?? media.images[0]} />
        <div className="bg-black/42 absolute inset-0" />
        <article className="relative z-10 flex h-full items-center justify-center px-6 pb-8 pt-20 sm:px-12 lg:px-20">
          <div className="mx-auto max-w-[58rem] text-center">
            <h2
              className={`font-script text-[clamp(2.4rem,6vw,5.7rem)] normal-case leading-[0.92] text-white transition duration-1000 ${
                activeIndex === 2 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              {copy.title}
            </h2>
            <p
              className={`mx-auto mt-7 max-w-[54rem] font-sans text-[clamp(0.55rem,0.83vw,0.78rem)] uppercase leading-[1.82] tracking-[0.09em] text-white/90 transition delay-200 duration-1000 sm:mt-9 ${
                activeIndex === 2 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              {copy.body}
            </p>
          </div>
        </article>
      </section>

      {additionalMedia.map((item, index) => {
        const poster = media.images[(index + 1) % media.images.length] ?? media.images[0];

        return (
          <section
            key={`${item.type}-${item.src}`}
            data-story-panel
            className="absolute inset-0 overflow-hidden bg-black"
            style={{ zIndex: 4 + index }}
          >
            {item.type === 'image' ? (
              <Image
                src={item.src}
                alt={`${campaign.title} editorial chapter ${index + 2}`}
                fill
                quality={100}
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <MediaBackground video={item.src} image={poster} />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20" />
          </section>
        );
      })}

      <section
        data-story-panel
        className="absolute inset-0 overflow-hidden bg-black"
        style={{ zIndex: 4 + additionalMedia.length }}
      >
        <Image
          src={nextMedia.images[0]}
          alt={`${nextCampaign.title} preview`}
          fill
          quality={100}
          sizes="100vw"
          className="object-cover"
        />
        <div className="bg-black/48 absolute inset-0" />
        <Link
          href={`/campaigns/${nextCampaign.slug}`}
          className="group relative z-10 flex h-full items-center justify-center px-6 text-center"
        >
          <div>
            <p className="font-display text-[0.58rem] uppercase tracking-[0.44em] text-[#f6c452]">
              Next Project
            </p>
            <h2 className="mt-5 font-title text-[clamp(3.2rem,9vw,9rem)] uppercase leading-[0.8] tracking-[-0.02em] text-white transition duration-700 group-hover:text-[#f7d58e]">
              {nextCampaign.title.split(' - ')[0]}
            </h2>
            <span className="relative mx-auto mt-8 block h-12 w-28 transition duration-700 group-hover:translate-x-3 sm:h-16 sm:w-36">
              <Image
                src="/assets/icones/feedbacks/site-arrow.svg"
                alt=""
                fill
                className="object-contain"
              />
            </span>
          </div>
        </Link>
      </section>

      <Link
        href="/campaigns"
        aria-label="All campaigns"
        className="text-white/78 group absolute left-5 top-20 z-20 flex items-center gap-3 py-2 font-display text-[0.56rem] uppercase tracking-[0.32em] transition hover:text-[#f6c452] sm:left-10 sm:top-24"
      >
        <span className="relative block h-5 w-10 rotate-180 transition group-hover:-translate-x-1">
          <Image
            src="/assets/icones/feedbacks/site-arrow.svg"
            alt=""
            fill
            className="object-contain"
          />
        </span>
        All Campaigns
      </Link>

      <div
        className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2"
        aria-label={`Chapter ${activeIndex + 1} of ${panelCount}`}
      >
        {Array.from({ length: panelCount }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Go to chapter ${index + 1}`}
            className={`h-px transition-all duration-500 ${activeIndex === index ? 'w-10 bg-[#f6c452]' : 'w-5 bg-white/45 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </main>
  );
}

function MediaBackground({
  video,
  image,
  priority,
}: {
  video?: string;
  image: string;
  priority?: boolean;
}) {
  if (video) {
    return (
      <SmartVideo
        wrapperClassName="absolute inset-0"
        className="h-full w-full object-cover"
        src={video}
        poster={image}
        fallbackImage={image}
        autoPlay
        muted
        loop
        playsInline
        priority={priority}
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={image}
      alt=""
      fill
      priority={priority}
      quality={100}
      sizes="100vw"
      className="object-cover"
    />
  );
}
