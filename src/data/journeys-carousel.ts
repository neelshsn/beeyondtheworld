import type { Journey } from '@/types/journey';

export const journeys: Journey[] = [
  {
    id: 'india-january-2026',
    slug: 'india-january-2026',
    title: 'India Palace Circuit',
    season: 'fall-winter',
    seasonTags: ['spring-summer', 'fall-winter'],
    seasonVisuals: {
      'fall-winter': {
        image:
          '/assets/journeys/india-january-2026/india-january-2026-all-journeys-fall-winter-thumbnail.jpg',
        backgroundVideo:
          '/assets/journeys/india-january-2026/india-january-2026-location-kerala-background.mp4',
      },
    },
    date: 'January 2026',
    location: 'Jaipur, Udaipur & Goa, India',
    image: '/assets/journeys/india-january-2026/india-january-2026-all-journeys-thumbnail.jpg',
    backgroundVideo: '/assets/journeys/india-january-2026/anime_cette_image__Kling_30__17267.mp4',
    regions: ['asia'],
    moods: ['city', 'spiritual'],
  },
];
