import type { Journey } from '@/types/journey';

export const journeys: Journey[] = [
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
    date: 'From 20th June to 5th October 2026',
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
    date: 'From 20th June to 5th October 2026',
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
    date: 'January 1st to October 2nd, 2026',
    location: 'Jaipur, Udaipur & Goa, India',
    image: '/assets/journeys/india-january-2026/india-january-2026-all-journeys-thumbnail.jpg',
    backgroundVideo: '/assets/journeys/india-january-2026/anime_cette_image__Kling_30__17267.mp4',
    regions: ['asia'],
    moods: ['city', 'spiritual'],
  },
];
