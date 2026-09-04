import type { CampaignShowcase } from './showcases';
import type { CampaignTaleContent } from '@/types/editorial-content';

const STORY_COPY: Record<string, Pick<CampaignTaleContent, 'title' | 'body'>> = {
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

const MEDIA_OVERRIDES: Record<
  string,
  Partial<Pick<CampaignTaleContent, 'heroVideo' | 'storyVideo' | 'videos' | 'images'>>
> = {
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

export function buildDefaultCampaignTale(campaign: CampaignShowcase): CampaignTaleContent {
  const override = MEDIA_OVERRIDES[campaign.slug] ?? {};
  const derivedVideos = unique([
    campaign.hero.type === 'video' ? campaign.hero.src : undefined,
    ...campaign.gallery.map((item) => (item.type === 'video' ? item.src : undefined)),
  ]);
  const galleryImages = unique([
    ...campaign.gallery.map((item) => (item.type === 'image' ? item.src : undefined)),
  ]);
  const fallbackImage = campaign.hero.type === 'image' ? campaign.hero.src : campaign.hero.poster;
  const images = unique([...(override.images ?? []), ...galleryImages]);
  const resolvedImages = (images.length ? images : unique([fallbackImage])).slice(0, 5);
  const videos = unique([
    override.heroVideo,
    ...derivedVideos,
    override.storyVideo,
    ...(override.videos ?? []),
  ]).slice(0, 5);
  const copy = STORY_COPY[campaign.slug] ?? {
    title: campaign.headline,
    body: campaign.summary.toUpperCase(),
  };

  return {
    ...copy,
    heroVideo: override.heroVideo ?? videos[0],
    storyVideo: override.storyVideo ?? videos[1] ?? videos[0],
    videos,
    images: resolvedImages.length ? resolvedImages : ['/assets/home/kenya-transition.jpg'],
  };
}
