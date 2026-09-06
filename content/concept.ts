export type ConceptNodeId =
  | 'overview'
  | 'coJourney'
  | 'signatureJourney'
  | 'investingBeyondCreation'
  | 'csrLabel'
  | 'communities'
  | 'impacts';

export type ConceptDetail = {
  icon: string;
  text: string;
};

export type ConceptBackground =
  | {
      type: 'video';
      src: string;
      poster?: string;
    }
  | {
      type: 'image';
      src: string;
    };

export type ConceptInteractiveNode = {
  kind: 'interactive';
  id: ConceptNodeId;
  title: string;
  description: string;
  openTitle: string;
  icon: string;
  details: ConceptDetail[];
  background: ConceptBackground;
};

export type ConceptEditorialNode = {
  kind: 'editorial';
  id: ConceptNodeId;
  title: string;
  body: readonly string[];
  layout: 'centered' | 'columns';
};

export type ConceptOverviewNode = {
  kind: 'overview';
  id: 'overview';
  title: string;
  description: string;
  background: ConceptBackground;
};

export type ConceptNode = ConceptInteractiveNode | ConceptEditorialNode | ConceptOverviewNode;

const defaultBackground: ConceptBackground = {
  type: 'video',
  src: '/assets/campaigns/almaaz-kenya/almaaz-kenya-story.mp4',
  poster: '/assets/campaigns/almaaz-kenya/almaaz-kenya-cover.jpg',
};

export const conceptNodes: ConceptNode[] = [
  {
    kind: 'overview',
    id: 'overview',
    title: 'One vision. Two ways to create with Beeyond.',
    description: 'Choose the production model that best fits your campaign.',
    background: defaultBackground,
  },
  {
    kind: 'interactive',
    id: 'coJourney',
    title: 'SHARED JOURNEYS',
    description:
      'ONE DESTINATION, SEVERAL VISUAL PRODUCTIONS. WE WEAVE\nNON-COMPETING BRANDS INTO SHARED JOURNEYS SO EVERY\nPATH LIGHTENS FIXED COSTS AND FOOTPRINT WHILE GUARDING\nEACH TALE AS SOMETHING INTIMATE AND RARE.',
    openTitle: 'Intelligent Resource Optimization',
    icon: '/assets/icones/Ico Gold BEE-02.svg',
    details: [
      {
        icon: '/assets/icones/Ico Gold BEE-10.svg',
        text: "Our World's environment curated itineraries per brand for creative pathways, allowing each identity to unfold in its own narrative, aesthetic and rhythm within one shared ecosystem.",
      },
      {
        icon: '/assets/icones/Ico Gold BEE-04.svg',
        text: 'A carefully curated talent pool operating within the Bee Label Quality Framework where confidentiality is safeguarded; cross-brand producers stay aligned while keeping briefs confidential and non-competitive.',
      },
      {
        icon: '/assets/icones/Ico Gold BEE-08.svg',
        text: 'Within our dedicated creative pods, each brand receives its own protected universe with exclusive casting, customised styling, and singular narrative arcs, carefully crafted to guarantee complete differentiation and non-competition across every campaign.',
      },
    ],
    background: defaultBackground,
  },
  {
    kind: 'interactive',
    id: 'signatureJourney',
    title: 'SIGNATURE JOURNEY',
    description:
      'SIGNATURE CREATION IS OUR MOST BESPOKE EXPRESSION OF BEEYONDTHEWORLD.\nA FULLY CUSTOM PRODUCTION BUILT AROUND THE BRAND’S VISION, TERRITORY AND AMBITION. EACH JOURNEY COMBINES CREATIVE FREEDOM WITH A LOCAL IMPACT LAYER, CONNECTING INTERNATIONAL TALENT, LOCAL KNOWLEDGE AND REGENERATIVE ACTION WITHOUT COMPROMISING EXCLUSIVITY OR DISCRETION. THE RESULT IS MORE THAN A CAMPAIGN: A DISTINCTIVE VISUAL WORLD THAT BUILDS BRAND VALUE WHILE LEAVING MEASURABLE VALUE BEHIND IN THE PLACE THAT MADE IT POSSIBLE.',
    openTitle: 'Investing Beyond Creation',
    icon: '/assets/icones/feedbacks/concept-signature-journey.svg',
    details: [
      {
        icon: '/assets/icones/feedbacks/concept-signature-impact.svg',
        text: 'Signature Creation turns creative budgets into Creative & Impact Capital, directing part of each investment toward verified local initiatives that support communities, cultural heritage, artisans and environmental restoration. The result is a production model where brand investment generates both campaign value and measurable long-term impact.',
      },
      {
        icon: '/assets/icones/feedbacks/concept-beyond-creation.svg',
        text: 'Each Signature Creation strengthens Bee’s ecosystem by connecting brands with verified local initiatives, communities and regenerative projects in the territories where campaigns are produced. As creative investment grows, so does the scale of local value created, allowing every campaign to generate impact that lasts beyond the content itself.',
      },
    ],
    background: defaultBackground,
  },
  {
    kind: 'interactive',
    id: 'csrLabel',
    title: 'CSR LABEL',
    description:
      'BEE DEFINES A CLEAR FRAMEWORK OF STANDARDS AND PROTOCOLS FOR EVERY STAGE OF PRODUCTION. FROM PRE-PRODUCTION TO FINAL DELIVERY, ENSURING THAT ALL TEAMS OPERATE WITH AWARENESS, RESPECT, AND OPTIMISATION OF HUMAN, ENVIRONMENTAL, AND MATERIAL RESOURCES.',
    openTitle: 'Sustainable Transition in Advertising',
    icon: '/assets/icones/Ico Gold BEE-13.svg',
    details: [
      {
        icon: '/assets/icones/feedbacks/concept-quality-charter.svg',
        text: 'Bee Authenticator protects human creativity and makes the creation process traceable. AI may support workflows and production efficiency, but never replace artistic vision, lived experience or human sensitivity. Through the Bee Authenticator, each campaign documents its creative provenance and process with transparency, protecting the human value behind the work.',
      },
      {
        icon: '/assets/icones/Ico Gold BEE-17.svg',
        text: 'Sustainable guidelines that frame attitude, behavior, ethics, and creative execution across all departments. They ensure consistency, respect, and excellence - from pre-production to post-production. Every talent and partner operates under shared values and clear expectations.',
      },
      {
        icon: '/assets/icones/feedbacks/concept-sustainable-development.svg',
        text: 'Every advertising production is fully traceable through our in-house technology. By measuring carbon footprint, resource optimization, Bee Sustainable Guidelines compliance, verified NJOs and geo-localized initiatives, every campaign actively contributes to worldwide sustainable development while providing transparent proof of its environmental, cultural and human impact.',
      },
    ],
    background: defaultBackground,
  },
  {
    kind: 'interactive',
    id: 'communities',
    title: 'WORLDWIDE COMMUNITIES',
    description:
      'WE UNITE WORLD-CLASS CREATIVES WITH STANDOUT LOCAL TALENTS, GUIDING EACH CONTRIBUTOR THROUGH RIGOROUS CARE SO THEIR CRAFT FLOURISHES WITHOUT COMPROMISE.',
    openTitle: 'Worldwide Creative Communities',
    icon: '/assets/icones/Ico Gold BEE-04.svg',
    details: [
      {
        icon: '/assets/icones/Ico Gold BEE-10.svg',
        text: 'A dynamic network of worldwide talents, versatile in style, refined in execution, and united by a shared standard of excellence and consciousness. From production directors to photographers and stylists, each collaborator is carefully sourced for their ability to adapt, elevate, and contribute to the creative vision with precision, artistry, and professionalism.',
      },
      {
        icon: '/assets/icones/Ico Gold BEE-16.svg',
        text: 'Every destination carries its own cultural intelligence, rhythm, and craftsmanship. Local inclusion turns production into a respectful collaboration with the people and knowledge already present. The Bee Label prioritises local talent and materials - not as a constraint, but as enrichment by highlighting cultures of the world while ensuring fair redistribution, authentic storytelling, and deeper creative resonance.',
      },
    ],
    background: defaultBackground,
  },
  {
    kind: 'interactive',
    id: 'impacts',
    title: 'IMPACTS',
    description:
      'THE HONEY IS THE TANGIBLE ESSENCE OF OUR JOURNEYS DISTILLED THROUGH COLLABORATION, AWARENESS AND CREATIVE INTENTION. IT STANDS AS LIVING PROOF OF WHAT OUR ECOSYSTEM CAN GENERATE VISUALLY, SOCIALLY AND SOCIETALLY. MORE THAN CONTENT, IT IS THE RESULT OF ACTION, ENCOUNTER AND SHARED RESPONSIBILITY. EACH HONEY UNIQUELY REFLECTING A HIVE, A JOURNEY AND A WAY OF SEEING THE WORLD.',
    openTitle: 'Honey of Humans Pollination',
    icon: '/assets/icones/Ico Gold BEE-06.svg',
    details: [
      {
        icon: '/assets/icones/Ico Gold BEE-15.svg',
        text: 'Visual content with purpose: activism, awareness, and storytelling that highlight causes, initiatives or realities discovered during our journeys. These projects are produced with local teams and aim to generate resonance and visibility - not only aesthetics, but meaning.',
      },
      {
        icon: '/assets/icones/Ico Gold BEE-04.svg',
        text: 'Support and inclusion of local communities, access to opportunities, fair collaboration and transmission of resources. Through the Bee Label methodology, part of each production cycle is committed to strengthening human value, both within our talent ecosystem and within the territories we encounter.',
      },
      {
        icon: '/assets/icones/Ico Gold BEE-12.svg',
        text: 'Societal impact contributes to public awareness, cultural protection and collective responsibility. It encourages conversations about how fashion, advertising and media can evolve, and demonstrates that production can be both refined and conscious.',
      },
    ],
    background: defaultBackground,
  },
];
