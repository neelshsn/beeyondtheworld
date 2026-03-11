import type { Journey } from '@/types/journey';

export const journeys: Journey[] = [
  {
    id: 'balearic',
    slug: 'balearic',
    title: 'Balearic',
    season: 'spring-summer',
    seasonTags: ['spring-summer', 'fall-winter'],
    seasonVisuals: {
      'spring-summer': {
        image: '/assets/journeys/balearic-2026/balearic-spring-summer-thumbnail.png',
        backgroundVideo: '/assets/journeys/balearic-2026/balearic-location-ibiza-background.png',
      },
      'fall-winter': {
        image: '/assets/journeys/balearic-2026/balearic-fall-winter-thumbnail.png',
        backgroundVideo: '/assets/journeys/balearic-2026/balearic-location-mallorca-background.png',
      },
    },
    date: 'From 1st May to 30th September',
    location: 'Mallorca, Ibiza & Menorca, Balearic',
    image: '/assets/journeys/balearic-2026/balearic-all-journeys-thumbnail.png',
    backgroundVideo: '/assets/journeys/balearic-2026/balearic-all-journeys-thumbnail.png',
    regions: ['europe'],
    moods: ['beach', 'nature'],
  },
  {
    id: 'italy',
    slug: 'italy',
    title: 'Italy',
    season: 'spring-summer',
    seasonTags: ['spring-summer', 'fall-winter'],
    seasonVisuals: {
      'spring-summer': {
        image: '/assets/journeys/italy-2026/italy-spring-summer-thumbnail.png',
        backgroundVideo: '/assets/journeys/italy-2026/italy-location-sicily-background.png',
      },
      'fall-winter': {
        image: '/assets/journeys/italy-2026/italy-fall-winter-thumbnail.png',
        backgroundVideo: '/assets/journeys/italy-2026/italy-location-dolomites-background.png',
      },
    },
    date: 'From 1st May to 30th June',
    location: 'Tuscany, Dolomites, Sicily & Amalfi, Italy',
    image: '/assets/journeys/italy-2026/italy-all-journeys-thumbnail.jpg',
    backgroundVideo: '/assets/journeys/italy-2026/italy-all-journeys-thumbnail.jpg',
    regions: ['europe'],
    moods: ['nature', 'beach', 'city'],
  },
  {
    id: 'morocco',
    slug: 'morocco',
    title: 'Morocco',
    season: 'spring-summer',
    seasonTags: ['spring-summer', 'fall-winter'],
    seasonVisuals: {
      'spring-summer': {
        image: '/assets/journeys/morocco-2026/morocco-spring-summer-thumbnail.png',
        backgroundVideo: '/assets/journeys/morocco-2026/morocco-location-agafay-background.png',
      },
      'fall-winter': {
        image: '/assets/journeys/morocco-2026/morocco-fall-winter-thumbnail.png',
        backgroundVideo: '/assets/journeys/morocco-2026/morocco-location-ouarzazate-background.png',
      },
    },
    date: 'From 1st April to 30th June',
    location: 'Ouarzazate, Agafay, Dakhla, Taghazout & Essaouira, Morocco',
    image: '/assets/journeys/morocco-2026/morocco-all-journeys-thumbnail.png',
    backgroundVideo: '/assets/journeys/morocco-2026/morocco-all-journeys-thumbnail.png',
    regions: ['africa'],
    moods: ['desert', 'beach', 'city'],
  },
  {
    id: 'france',
    slug: 'france',
    title: 'France',
    season: 'spring-summer',
    seasonTags: ['spring-summer', 'fall-winter'],
    seasonVisuals: {
      'spring-summer': {
        image: '/assets/journeys/france-2026/france-spring-summer-thumbnail.png',
        backgroundVideo: '/assets/journeys/france-2026/france-location-provence-background.png',
      },
      'fall-winter': {
        image: '/assets/journeys/france-2026/france-fall-winter-thumbnail.png',
        backgroundVideo: '/assets/journeys/france-2026/france-location-avoriaz-background.png',
      },
    },
    date: 'From 1st June to 30th September',
    location: 'Provence, Camargue & Avoriaz, France',
    image: '/assets/journeys/france-2026/france-all-journeys-thumbnail.png',
    backgroundVideo: '/assets/journeys/france-2026/france-all-journeys-thumbnail.png',
    regions: ['europe'],
    moods: ['nature', 'beach'],
  },
  {
    id: 'azores',
    slug: 'azores',
    title: 'Azores',
    season: 'spring-summer',
    seasonTags: ['spring-summer', 'fall-winter'],
    seasonVisuals: {
      'spring-summer': {
        image: '/assets/journeys/azores-2026/azores-spring-summer-thumbnail.jpg',
        backgroundVideo: '/assets/journeys/azores-2026/azores-location-azores-background.jpg',
      },
      'fall-winter': {
        image: '/assets/journeys/azores-2026/azores-fall-winter-thumbnail.jpg',
        backgroundVideo: '/assets/journeys/azores-2026/azores-location-azores-background.jpg',
      },
    },
    date: 'From 1st June to 30th September',
    location: 'Azores',
    image: '/assets/journeys/azores-2026/azores-all-journeys-thumbnail.jpg',
    backgroundVideo: '/assets/journeys/azores-2026/azores-all-journeys-thumbnail.jpg',
    regions: ['europe'],
    moods: ['nature', 'beach'],
  },
  {
    id: 'thailand',
    slug: 'thailand',
    title: 'Thailand',
    season: 'spring-summer',
    seasonTags: ['spring-summer', 'fall-winter'],
    seasonVisuals: {
      'spring-summer': {
        image: '/assets/journeys/thailand-2026/thailand-spring-summer-thumbnail.png',
        backgroundVideo:
          '/assets/journeys/thailand-2026/thailand-location-koh-phi-phi-background.png',
      },
      'fall-winter': {
        image: '/assets/journeys/thailand-2026/thailand-fall-winter-thumbnail.png',
        backgroundVideo: '/assets/journeys/thailand-2026/thailand-location-bangkok-background.png',
      },
    },
    date: 'From 1st December to 31st March 2026',
    location: 'Khao Sok, Bangkok & Koh Phi Phi, Thailand',
    image: '/assets/journeys/thailand-2026/thailand-all-journeys-thumbnail.png',
    backgroundVideo: '/assets/journeys/thailand-2026/thailand-all-journeys-thumbnail.png',
    regions: ['asia'],
    moods: ['nature', 'city', 'beach'],
  },
  {
    id: 'philippines',
    slug: 'philippines',
    title: 'Philippines',
    season: 'spring-summer',
    seasonTags: ['spring-summer', 'fall-winter'],
    seasonVisuals: {
      'spring-summer': {
        image: '/assets/journeys/philippines-2026/philippines-spring-summer-thumbnail.png',
      },
      'fall-winter': {
        image: '/assets/journeys/philippines-2026/philippines-fall-winter-thumbnail.png',
      },
    },
    date: 'From 1st March to 31st May 2026',
    location: 'Palawan, Bukidnon & Siargao, Philippines',
    image: '/assets/journeys/philippines-2026/philippines-all-journeys-thumbnail.png',
    regions: ['asia'],
    moods: ['nature', 'beach'],
  },
  {
    id: 'india-january-2026',
    slug: 'india-january-2026',
    title: 'India Palace Circuit',
    season: 'fall-winter',
    seasonTags: ['spring-summer', 'fall-winter'],
    seasonVisuals: {
      'spring-summer': {
        image:
          '/assets/journeys/india-january-2026/india-january-2026-all-journeys-spring-summer-thumbnail.jpeg',
        backgroundVideo:
          '/assets/journeys/india-january-2026/india-january-2026-location-goa-background.mp4',
      },
      'fall-winter': {
        image:
          '/assets/journeys/india-january-2026/india-january-2026-all-journeys-fall-winter-thumbnail.jpg',
        backgroundVideo:
          '/assets/journeys/india-january-2026/india-january-2026-location-kerala-background.mp4',
      },
    },
    date: 'From 1st November 2026 to 31st March 2027',
    location: 'Jaipur, Udaipur & Goa, India',
    image: '/assets/journeys/india-january-2026/india-january-2026-all-journeys-thumbnail.jpg',
    backgroundVideo: '/assets/journeys/india-january-2026/anime_cette_image__Kling_30__17267.mp4',
    regions: ['asia'],
    moods: ['city', 'spiritual'],
  },
];
