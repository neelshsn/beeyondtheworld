import type { LocationMedia } from '@/lib/db/schema';

export type JourneyLocationSeed = {
  name: string;
  subtitle: string | null;
  leftTitle: string[];
  narrative: string;
  image: string | null;
  video: string | null;
  media: LocationMedia[];
};

/**
 * Contenu initial des Locations / Tales, extrait des pages Journey historiques.
 * Le dashboard importe uniquement les Locations manquantes, sans modifier les entrées existantes.
 */
export const journeyLocationSeeds: Record<string, JourneyLocationSeed[]> = {
  azores: [
    {
      name: 'Azores',
      subtitle: 'Volcanic Lakes',
      leftTitle: ['The', 'Silence', 'of the Azores'],
      narrative:
        'In the heart of the Atlantic Ocean, the Azores rise like a mirage of deep greens and endless blues. Between volcanic lakes shimmering in emerald tones, cliffs lined with pale hydrangeas, and mist-washed forests glowing in golden light. The light is ever-changing, soft and milky above the craters, then brilliant over the open sea. The Azores invite you to slow down, wander along paths suspended between sky and water, and feel the rare harmony of a land shaped by fire yet soothed by the ocean.',
      image: '/assets/journeys/portugal-2026/portugal-azores.webp',
      video: '/assets/journeys/portugal-2026/portugal-azores.webp',
      media: [
        {
          url: '/assets/journeys/portugal-2026/portugal-azores.webp',
          type: 'image',
          alt: 'Azores tale',
        },
      ],
    },
    {
      name: 'Madeira',
      subtitle: 'Cloud Mountains',
      leftTitle: ['Above', 'the Clouds,', 'the Atlantic'],
      narrative:
        'Madeira rises from the Atlantic in a succession of volcanic peaks, laurel forests, and vertiginous coastlines. At sunrise, mountain paths float above a sea of clouds before descending through fern-lined levadas toward hidden viewpoints and villages poised over the ocean. The island moves between wild scale and quiet intimacy: raw cliffs, botanical abundance, and tables set at the edge of the horizon. Madeira offers a visual language of elevation and elemental softness, where every frame seems suspended between mist, stone, and deep blue water.',
      image: '/assets/journeys/portugal-2026/portugal-madeira.webp',
      video: '/assets/journeys/portugal-2026/portugal-madeira.webp',
      media: [
        {
          url: '/assets/journeys/portugal-2026/portugal-madeira.webp',
          type: 'image',
          alt: 'Madeira tale',
        },
      ],
    },
    {
      name: 'Lisboa',
      subtitle: 'Tiled Light',
      leftTitle: ['Where', 'Light', 'Climbs', 'the City'],
      narrative:
        'Lisboa unfolds in warm light across tiled facades, steep streets, and terraces opening toward the Tagus. The city carries a graceful tension between patina and modern rhythm: yellow trams cross patterned walls, shaded cafes invite a slower pause, and late-afternoon sun turns every balcony and pavement into a cinematic surface. Lisboa is both intimate and expansive, a lived-in capital whose color, craft, and Atlantic horizon create an unmistakable setting for contemporary stories.',
      image: '/assets/journeys/portugal-2026/portugal-lisboa.webp',
      video: '/assets/journeys/portugal-2026/portugal-lisboa.webp',
      media: [
        {
          url: '/assets/journeys/portugal-2026/portugal-lisboa.webp',
          type: 'image',
          alt: 'Lisboa tale',
        },
      ],
    },
  ],
  balearic: [
    {
      name: 'Mallorca',
      subtitle: 'Golden Calas',
      leftTitle: ['Golden', 'Stone &', 'Sea Air'],
      narrative:
        'In Mallorca, warm stone villages and hidden calas seem carved by the same soft Mediterranean light. Terraces of olive trees and dry-stone walls descend toward the sea, while cliffs and coves hold water in endless shades of blue. The island feels balanced between mineral stillness and marine openness, between inland calm and coastal brilliance. Mallorca is an art of living shaped by sun, salt, and silence, where every landscape seems composed with effortless grace.',
      image: '/assets/journeys/balearic-2026/balearic-location-mallorca-thumbnail.png',
      video: '/assets/journeys/balearic-2026/balearic-location-mallorca-background.png',
      media: [
        {
          url: '/assets/journeys/balearic-2026/balearic-location-mallorca-story.jpg',
          type: 'image',
          alt: 'Mallorca tale',
        },
      ],
    },
    {
      name: 'Ibiza',
      subtitle: 'White Cliffs',
      leftTitle: ['White', 'Horizons', 'After Light'],
      narrative:
        'Ibiza reveals a quieter majesty beyond its myths: whitewashed houses against the sky, cliffs descending into clear water, and evenings that dissolve slowly into rose and amber. The island carries a sense of freedom that feels both luminous and grounded. Pine trees scent the air, hidden coves open suddenly between rocky paths, and the sea remains the constant horizon. Ibiza is a space of release and clarity, where light strips everything back to essentials.',
      image: '/assets/journeys/balearic-2026/balearic-location-ibiza-thumbnail.png',
      video: '/assets/journeys/balearic-2026/balearic-location-ibiza-background.png',
      media: [
        {
          url: '/assets/journeys/balearic-2026/balearic-location-ibiza-story.jpg',
          type: 'image',
          alt: 'Ibiza tale',
        },
      ],
    },
    {
      name: 'Menorca',
      subtitle: 'Quiet Turquoise',
      leftTitle: ['Where', 'Silence', 'Meets', 'Turquoise'],
      narrative:
        'Menorca unfolds with a more hushed beauty. The coves are smaller, the waters impossibly clear, and the landscapes feel almost untouched. Paths run through low stone walls and pale vegetation before opening onto quiet beaches where turquoise water seems suspended in still air. Everything here invites slowness. Menorca is a Mediterranean retreat in its purest form, discreet, luminous, and deeply peaceful.',
      image: '/assets/journeys/balearic-2026/balearic-location-menorca-thumbnail.png',
      video: '/assets/journeys/balearic-2026/balearic-location-menorca-background.png',
      media: [
        {
          url: '/assets/journeys/balearic-2026/balearic-location-menorca-story.jpg',
          type: 'image',
          alt: 'Menorca tale',
        },
      ],
    },
  ],
  france: [
    {
      name: 'Provence',
      subtitle: 'Stone Gardens',
      leftTitle: ['The Art', 'of Provence'],
      narrative:
        'In Provence, warm light wraps around fragrant hills and sun-soaked stone houses. Pale shutters open onto gardens overflowing with bougainvillea and white blossoms, while cypress and pine trees trace the horizon toward the distant sea. At golden hour, everything softens, the stones turn ochre, the air carries the scent of warm earth and dry herbs. Provence is a gentle way of life, a peaceful landscape where time slows between nature, light, and silence.',
      image: '/assets/journeys/france-2026/france-location-provence-thumbnail.png',
      video: '/assets/journeys/france-2026/france-location-provence-background.png',
      media: [
        {
          url: '/assets/journeys/france-2026/france-location-provence-story.jpg',
          type: 'image',
          alt: 'Provence tale',
        },
      ],
    },
    {
      name: 'Camargue',
      subtitle: 'Salt Lagoons',
      leftTitle: ['Salt', 'Wind', '& Freedom'],
      narrative:
        'In the Camargue, water and sky blend into endless pastel tones. White horses gallop through the lagoons, scattering silver reflections, while pink flamingos drift across still waters. Between reeds and salt flats, wooden walkways lead toward a flat horizon bathed in soft light. Here, silence prevails, broken only by wind and birds - a wild and fragile land where nature still reigns.',
      image: '/assets/journeys/france-2026/france-location-camargue-thumbnail.png',
      video: '/assets/journeys/france-2026/france-location-camargue-background.png',
      media: [
        {
          url: '/assets/journeys/france-2026/france-location-camargue-story.jpg',
          type: 'image',
          alt: 'Camargue tale',
        },
      ],
    },
    {
      name: 'Avoriaz',
      subtitle: 'Alpine Horizons',
      leftTitle: ['Elevate', 'Your Senses'],
      narrative:
        'In Avoriaz, the mountains stretch between alpine lakes and deep forests, bathed in pure, crystalline light. Peaks mirror themselves in still waters while the meadows glow at sunrise and sunset. Wooden chalets overlook green valleys, and trails wind through fir trees and wildflowers. Here, the air is fresh and the silence soothing, an alpine escape where nature sets a simple, majestic rhythm.',
      image: '/assets/journeys/france-2026/france-location-avoriaz-thumbnail.png',
      video: '/assets/journeys/france-2026/france-location-avoriaz-background.png',
      media: [
        {
          url: '/assets/journeys/france-2026/france-location-avoriaz-story.jpg',
          type: 'image',
          alt: 'Avoriaz tale',
        },
      ],
    },
  ],
  'india-january-2026': [
    {
      name: 'Rajasthan',
      subtitle: 'Jaipur & Udaipur',
      leftTitle: ['Where', 'Sun teach', 'the', 'world', 'to dream.'],
      narrative:
        'In the golden vastness of Rajasthan, the sun melts into the desert like a secret whispered to the earth, setting the dunes ablaze in hues that exist nowhere else. Ancient cities rise like mirages carved from time itself, their temples breathing centuries of devotion and their palaces catching the last light as if holding it gently in their hands. In this land of kings and legends, evenings unfold like sacred rituals: shadows stretch, bells echo, and the horizon becomes a canvas of fire and tenderness. Rajasthan is not a place you visit - it is a dream you step into, a universe suspended between memory and light, where every sunset feels like the beginning of a story you were always meant to hear.',
      image:
        '/assets/journeys/india-january-2026/india-january-2026-location-rajasthan-thumbnail.jpg',
      video: null,
      media: [
        {
          url: '/assets/locations/India1.jpg',
          type: 'image',
          alt: 'Rajasthan tale',
        },
      ],
    },
    {
      name: 'Kerala',
      subtitle: 'Backwaters & Highlands',
      leftTitle: ['Nature', 'Breathes', 'and the', 'Soul', 'Follows'],
      narrative:
        'Kerala drifts into the heart like a soft exhale, a world where water, forest, and sky speak in a language older than time. Along the tranquil backwaters, life floats at the pace of drifting coconut fronds, and the air is heavy with rain, earth, and the scent of distant spice hills. Mountains rise like whispered promises, tea gardens unfold like emerald waves, and the quiet wisdom of Ayurveda seems to linger in every breath. In Kerala, the boundaries between traveler and nature dissolve; you become part of the slow rhythm, the velvet green, the gentle pulse of life itself. It is a sanctuary where the world pauses, and the soul remembers how to listen.',
      image: '/assets/journeys/india-january-2026/india-january-2026-location-kerala-thumbnail.jpg',
      video:
        '/assets/journeys/india-january-2026/india-january-2026-location-kerala-background.mp4',
      media: [
        {
          url: '/assets/locations/India2.jpg',
          type: 'image',
          alt: 'Kerala tale',
        },
      ],
    },
    {
      name: 'Goa',
      subtitle: 'Coastline & Sunsets',
      leftTitle: ['Horizons', 'Made of', 'Ocean', 'lights'],
      narrative:
        'In Goa and across the hidden islands of Lakshadweep, the ocean becomes a dream without edges, stretching into shades of blue that feel almost unreal. Goa hums with a free-spirited heartbeat - golden beaches, palm-framed sunsets, and a breeze that carries a hint of music, salt, and stories of distant lands. Farther out, Lakshadweep emerges like a secret whispered by the sea: a constellation of coral islands suspended over crystal lagoons, untouched and impossibly serene. Here, time slips into the rhythm of the tides, and every horizon feels like a doorway into wonder. These shores are not just destinations - they are states of mind, where the world glows brighter, softer, and endlessly alive.',
      image: '/assets/journeys/india-january-2026/india-january-2026-location-goa-thumbnail.jpg',
      video: '/assets/journeys/india-january-2026/india-january-2026-location-goa-background.mp4',
      media: [
        {
          url: '/assets/locations/India3.jpg',
          type: 'image',
          alt: 'Goa tale',
        },
      ],
    },
  ],
  italy: [
    {
      name: 'Tuscany',
      subtitle: 'Cypress Hills',
      leftTitle: ['The Art', 'of Green,', 'Painted', 'by Nature'],
      narrative:
        'In Tuscany, the landscape unfolds in layers of green and gold, shaped by light and time. Rolling hills stretch gently into the distance, lined with vineyards, olive groves, and slender cypress trees that trace the horizon with quiet elegance. Morning mist softens the valleys, while stone villages rest calmly within the countryside. Here, nature and human presence exist in harmony, creating a timeless rhythm where beauty feels effortless and deeply serene.',
      image: '/assets/journeys/italy-2026/italy-location-tuscany-thumbnail.png',
      video: '/assets/journeys/italy-2026/italy-location-tuscany-background.jpg',
      media: [
        {
          url: '/assets/journeys/italy-2026/italy-location-tuscany-story.jpg',
          type: 'image',
          alt: 'Tuscany tale',
        },
      ],
    },
    {
      name: 'Dolomites',
      subtitle: 'Alpine Peaks',
      leftTitle: ['The', 'Silent Majesty', 'of Stone'],
      narrative:
        'In the Dolomites, nature rises in a more vertical language. Jagged peaks catch the shifting alpine light, while meadows, forests, and still lakes soften the scale of the mountains. Villages rest quietly beneath vast stone walls, and every path feels suspended between earth and sky. The air is pure, the rhythm slower, the silence almost mineral. Here, Italy becomes expansive and elemental, a landscape where grandeur and calm live side by side.',
      image: '/assets/journeys/italy-2026/italy-location-dolomites-thumbnail.png',
      video: '/assets/journeys/italy-2026/italy-location-dolomites-background.png',
      media: [
        {
          url: '/assets/journeys/italy-2026/italy-location-dolomites-story.jpg',
          type: 'image',
          alt: 'Dolomites tale',
        },
      ],
    },
    {
      name: 'Sicily',
      subtitle: 'Mediterranean Stone',
      leftTitle: ['Where', 'Time', 'Slow', 'Down'],
      narrative:
        'Sicily unfolds as a land of light, stone, and sea. In the Baroque streets of Noto, golden facades rise between narrow alleys, their ornate balconies and carved details reflecting centuries of history, while glimpses of the green countryside appear beyond the buildings. From a small balcony overlooking the sea, a simple table with a book and a cup of coffee invites quiet contemplation. The calm water, sculpted rocks, and pastel sky create a timeless scene where nature and everyday life blend effortlessly. Together, these images reveal Sicily’s essence: a place of architectural beauty and Mediterranean serenity, where grandeur and simplicity coexist in perfect balance.',
      image: '/assets/journeys/italy-2026/italy-location-sicily-thumbnail.png',
      video: '/assets/journeys/italy-2026/italy-location-sicily-background.png',
      media: [
        {
          url: '/assets/journeys/italy-2026/italy-location-sicily-story.jpg',
          type: 'image',
          alt: 'Sicily tale',
        },
      ],
    },
    {
      name: 'Amalfi',
      subtitle: 'Coastal Terraces',
      leftTitle: ['Cliffside', 'Days of', 'Salt & Light'],
      narrative:
        'Along the Amalfi Coast, houses cling to the cliffs above a sea that shifts from deep cobalt to silver with the passing light. Terraces overflow with lemon trees and pale stone stairways descend toward hidden coves and quiet harbors. The landscape feels sculpted by both nature and daily life, dramatic yet intimate, luminous yet grounded. Amalfi is a place where every turn opens onto another layer of sea, sky, and architecture, and where time seems to move with the rhythm of the coast itself.',
      image: '/assets/journeys/italy-2026/italy-location-amalfi-thumbnail.png',
      video: '/assets/journeys/italy-2026/italy-location-amalfi-background.jpg',
      media: [
        {
          url: '/assets/journeys/italy-2026/italy-location-amalfi-story.jpg',
          type: 'image',
          alt: 'Amalfi tale',
        },
      ],
    },
  ],
  morocco: [
    {
      name: 'Ouarzazate',
      subtitle: 'Desert & Lake',
      leftTitle: ['Between', 'Golden', 'Sands', '& Silent', 'Lakes'],
      narrative:
        'In Ouarzazate, light glides over vast deserts, shaping silence into shades of gold and amber. Ancient kasbahs emerge from the earth like forgotten dreams, while the horizon stretches endlessly, calm and powerful, under an immense sky. At Lalla Takerkoust, water brings a gentle pause to the land. The lake reflects the Atlas Mountains and the passing clouds, blending sky and stone into a peaceful, fluid harmony. Here, the air feels softer, and time seems to slow with each ripple. Ouarzazate and Lalla Takerkoust form a quiet dialogue between desert and water, a poetic balance where contrasts merge, and nature reveals its most timeless beauty.',
      image: '/assets/journeys/morocco-2026/morocco-location-ouarzazate-thumbnail.png',
      video: '/assets/journeys/morocco-2026/morocco-location-ouarzazate-background.png',
      media: [
        {
          url: '/assets/journeys/morocco-2026/morocco-location-ouarzazate-story.jpg',
          type: 'image',
          alt: 'Ouarzazate tale',
        },
      ],
    },
    {
      name: 'Agafay',
      subtitle: 'Stone Desert',
      leftTitle: ['Nomad', 'Earth to', 'Medina', 'Walls'],
      narrative:
        'From the quiet vastness of the Agafay Desert to the vibrant soul of Marrakech, beauty reveals itself through contrast. Agafay is a land of stone and silence, where light drifts slowly across pale earth and time seems suspended. Marrakech awakens the senses: red walls, winding medinas, and the echo of ancient gestures shaping daily life. Together, desert and city breathe as one: a quiet dream of earth and culture, where Morocco unfolds between stillness and motion.',
      image: '/assets/journeys/morocco-2026/morocco-location-agafay-thumbnail.png',
      video: '/assets/journeys/morocco-2026/morocco-location-agafay-background.png',
      media: [
        {
          url: '/assets/journeys/morocco-2026/morocco-location-agafay-story.jpg',
          type: 'image',
          alt: 'Agafay tale',
        },
      ],
    },
    {
      name: 'Dakhla',
      subtitle: 'Lagoon Horizon',
      leftTitle: ['Minimalist', 'Escape', 'Endless', 'Horizons'],
      narrative:
        'Dakhla reveals itself in silence, it does not demand attention, it invites contemplation. Soft dunes flow into the ocean, shaping clean, endless lines. Light moves gently across sand and water, leaving nothing unnecessary behind. Dakhla is a place to breathe. Wind, space, and horizon exist in perfect balance, creating a sense of calm that feels both raw and refined. Beauty is stripped back to its essence: natural, minimalist, and deeply soothing. Between lagoon and desert, time slows. Architecture blends into the landscape, textures speak louder than ornament, and simplicity becomes luxury.',
      image: '/assets/journeys/morocco-2026/morocco-location-dakhla-thumbnail.jpg',
      video: '/assets/journeys/morocco-2026/morocco-location-dakhla-background.jpg',
      media: [
        {
          url: '/assets/journeys/morocco-2026/morocco-location-dakhla-story.jpg',
          type: 'image',
          alt: 'Dakhla tale',
        },
      ],
    },
    {
      name: 'Taghazout',
      subtitle: 'Atlantic Surfline',
      leftTitle: ['Atlantic', 'Stillness', 'in Motion'],
      narrative:
        'In Taghazout, the Atlantic sets the rhythm. White houses climb the hillside above long surf lines, while palm shadows and warm stone paths lead toward quiet coves and open horizons. Paradise Valley adds a softer pulse to the landscape, where clear pools rest between sunlit rocks and clusters of argan trees. Everything feels suspended between movement and calm: the ocean always in motion, the land deeply at peace. Taghazout reveals a Morocco shaped by salt, wind, and light, where simplicity becomes a way of living and beauty unfolds without effort.',
      image: '/assets/journeys/morocco-2026/morocco-location-taghazout-thumbnail.png',
      video: '/assets/journeys/morocco-2026/morocco-location-taghazout-background.png',
      media: [
        {
          url: '/assets/journeys/morocco-2026/morocco-location-taghazout-story.jpg',
          type: 'image',
          alt: 'Taghazout tale',
        },
      ],
    },
    {
      name: 'Essaouira',
      subtitle: 'Wind Port',
      leftTitle: ['Blue Wind', 'on White', 'Stones'],
      narrative:
        'Essaouira moves to the sound of wind, gulls, and distant waves breaking below the ramparts. White walls edged in blue open onto narrow streets scented with salt and cedar, while the port glows with weathered boats and long Atlantic light. The city feels at once grounded and weightless, shaped by craft, sea air, and a slow, elegant rhythm. Here, Morocco turns softer, more mineral, more oceanic. Everything invites contemplation: the facades, the sky, the tide, the silence hidden beneath the breeze.',
      image: '/assets/journeys/morocco-2026/morocco-location-essaouira-thumbnail.png',
      video: '/assets/journeys/morocco-2026/morocco-location-essaouira-background.png',
      media: [
        {
          url: '/assets/journeys/morocco-2026/morocco-location-essaouira-story.jpg',
          type: 'image',
          alt: 'Essaouira tale',
        },
      ],
    },
  ],
  philippines: [
    {
      name: 'Palawan',
      subtitle: 'Twin Lagoon',
      leftTitle: ['Where', 'Paradise', 'Stays', 'Wild'],
      narrative:
        'In Palawan, islands seem to float on translucent waters shimmering in endless shades of turquoise. Jungle-covered limestone cliffs drop into hidden lagoons where the water becomes so clear it almost disappears. Sandbanks appear and vanish with the tide, and boats drift silently between rock formations. Everything feels untouched - just wind, salt, and light. Palawan feels like reaching the edge of the world, in a landscape still free and wild.',
      image: '/assets/journeys/philippines-2026/philippines-location-palawan-thumbnail.jpg',
      video: '/assets/journeys/philippines-2026/philippines-spring-summer-thumbnail.png',
      media: [
        {
          url: '/assets/journeys/philippines-2026/philippines-location-palawan-story.jpg',
          type: 'image',
          alt: 'Palawan tale',
        },
      ],
    },
    {
      name: 'Bukidnon',
      subtitle: 'Cloud Highlands',
      leftTitle: ['Where', 'Paradise', 'Stays', 'Wild'],
      narrative:
        'In Bukidnon, the highlands roll beneath an endless green blanket, often swallowed by a sea of clouds at sunrise. Roads cut through fields, plantations, and soft hills bathed in crisp, gentle light. Everything feels calm and suspended, the air cooler, the sounds distant, the landscape stretching endlessly. Bukidnon reveals another side of the Philippines, inland, serene, and deeply natural.',
      image: '/assets/journeys/philippines-2026/philippines-location-bukidnon-thumbnail.png',
      video: '/assets/journeys/philippines-2026/philippines-fall-winter-thumbnail.png',
      media: [
        {
          url: '/assets/journeys/philippines-2026/philippines-location-bukidnon-story.jpg',
          type: 'image',
          alt: 'Bukidnon tale',
        },
      ],
    },
    {
      name: 'Siargao',
      subtitle: 'Surf & Lagoons',
      leftTitle: ['Where', 'Paradise', 'Stays', 'Wild'],
      narrative:
        'On Siargao, palm trees lean toward a shifting turquoise sea and days unfold slowly between surf and sun. Dirt roads lead to quiet beaches, tidal pools glimmer at low tide, and golden afternoons dissolve into soft pastel sunsets. Life follows the rhythm of the ocean: simple, warm, and unhurried, a place where you do not chase time, you drift with it.',
      image: '/assets/journeys/philippines-2026/philippines-location-siargao-thumbnail.png',
      video: '/assets/journeys/philippines-2026/philippines-all-journeys-thumbnail.png',
      media: [
        {
          url: '/assets/journeys/philippines-2026/philippines-location-siargao-story.jpg',
          type: 'image',
          alt: 'Siargao tale',
        },
      ],
    },
  ],
  thailand: [
    {
      name: 'Khao Sok',
      subtitle: 'Rainforest Lake',
      leftTitle: ['Echoes', 'of Khao', 'Sok Lake'],
      narrative:
        'In the heart of Khao Sok National Park, the emerald lake stretches between towering limestone karsts rising from the water like islands suspended in mist. The calm surface reflects jungle-covered cliffs, where tropical light shifts from soft milky blues at dawn to deep golden hues at sunset. Traditional boats drift silently, inviting exploration of hidden coves, secret caves, and lush shorelines. Here, time seems to float with nature, a peaceful, mysterious atmosphere where water, rock, and forest blend into an almost unreal landscape.',
      image: '/assets/journeys/thailand-2026/thailand-location-khao-sok-thumbnail.png',
      video: '/assets/journeys/thailand-2026/thailand-location-khao-sok-background.png',
      media: [
        {
          url: '/assets/journeys/thailand-2026/thailand-location-khao-sok-story.jpg',
          type: 'image',
          alt: 'Khao Sok tale',
        },
      ],
    },
    {
      name: 'Bangkok',
      subtitle: 'Golden Chinatown',
      leftTitle: ['Endless', 'Evenings', 'Golden Noise'],
      narrative:
        'In Bangkok, the city pulses between tradition and modern intensity. Streets glow beneath colorful neon signs, lined with Chinese shopfronts, buzzing tuk-tuks, and street markets scented with spices. Behind half-open metal shutters, small counters welcome locals and travelers around steaming dishes, while dense traffic moves in a constant choreography. In the distance, hills fade into a warm golden haze, a reminder that nature is never far away. Bangkok is a full immersion, a continuous, vibrant, and chaotic energy where every alley tells a new story.',
      image: '/assets/journeys/thailand-2026/thailand-location-bangkok-thumbnail.png',
      video: '/assets/journeys/thailand-2026/thailand-location-bangkok-background.png',
      media: [
        {
          url: '/assets/journeys/thailand-2026/thailand-location-bangkok-story.jpg',
          type: 'image',
          alt: 'Bangkok tale',
        },
      ],
    },
    {
      name: 'Koh Phi Phi',
      subtitle: 'Turquoise Horizon',
      leftTitle: ['Turquoise', 'Silence'],
      narrative:
        'On Koh Phi Phi, the sea reveals every shade of turquoise and emerald, framed by pale sandy beaches and dramatic limestone cliffs. Colorful longtail boats rest gently on crystal-clear water while palm trees cast soft shadows along the shore. At sunset, the sky ignites in hues of orange and pink, wrapping the islands in a peaceful, almost unreal atmosphere. Everything here invites contemplation, a luminous tropical escape between rock, sea, and endless horizon.',
      image: '/assets/journeys/thailand-2026/thailand-location-koh-phi-phi-thumbnail.png',
      video: '/assets/journeys/thailand-2026/thailand-location-koh-phi-phi-background.png',
      media: [
        {
          url: '/assets/journeys/thailand-2026/thailand-location-koh-phi-phi-story.jpg',
          type: 'image',
          alt: 'Koh Phi Phi tale',
        },
      ],
    },
  ],
};
