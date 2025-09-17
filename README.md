# Beeyondtheworld Platform

Luxury immersive platform for fashion & lifestyle brand journeys. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, local font system (ADAM, Avenir, Saint Bartogenia), Supabase auth, and Sanity-ready schemas. Deploy-ready for Vercel.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + custom glow/glass tokens
- shadcn/ui primitives, Framer Motion animations
- Supabase Auth (email/password) with SSR helpers
- Sanity schema stubs for Campaign/Journey/Client
- ESLint + Prettier + Husky (lint-staged)

## Getting Started

```bash
npm install
npm run dev
```

### Required Environment Variables

Create `.env.local` with your Supabase project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

These values are needed for both middleware guards and the Supabase provider. Without them the client space will redirect to `/login` with an error.

### Seed Demo Account (client@test.com / test)

1. Open the Supabase SQL editor and run:
   ```sql
   insert into auth.users (id, email)
   values (gen_random_uuid(), 'client@test.com')
   on conflict (email) do nothing;
   ```
2. Create the password via the Admin API or CLI:
   ```bash
   supabase auth admin create-user \
     --email client@test.com \
     --password test \
     --email-confirmation
   ```
3. Optionally assign the user to a `clientProfile` document in your CMS once Phase 3 is connected.

## Fonts & Design System

- `ADAM` (all caps) drives hero/section titles with glow.
- `Avenir` for body copy and UI.
- `Saint Bartogenia` cursive accents via the `.title-script` utility.
- Glassmorphism utilities (`.glass-pane`) and glow shadows defined in `src/app/globals.css`.

## Project Structure Highlights

```
src/
  app/
    page.tsx                    # Public home (hero video, journeys, campaigns)
    concept/                    # Concept scrollytelling page
    login/                      # Supabase auth with video background
    client/                     # Authenticated client space
      layout.tsx                # Supabase session guard + header
      page.tsx                  # Dashboard filters & carousel
      journeys/[slug]/          # Journey sheet with export button
  components/
    primitives/                 # GlowTitle, GlassCard, ImmersiveVideo, etc.
    providers/supabase-provider.tsx
  data/                         # Public + client seed content
  lib/supabase/                 # Browser & server clients
  types/                        # Shared typings
cms/schemas/                    # Sanity schema definitions
public/fonts/                   # ADAM / Avenir / Saint Bartogenia
public/pdfs/                    # Deck + journey attachments
```

## Phase 2 - Client Space Features

- `/login` glassmorphic auth with Supabase email/password.
- Middleware lock for `/client` routes, redirecting unauthenticated users.
- Dashboard filters (country / budget / season) with ADAM titles.
- Journey sheet (`/client/journeys/italy-tuscany-venice`) covering creative direction, moodboard, section blocks, attachments.
- `Export PDF` button triggers browser print for quick PDF handoff.

## Phase 3 - CMS Schemas

Sanity schema blueprints live in `cms/schemas`:

- `campaign.ts`: title, slug, year, locations[], cover, heroVideo, gallery (image/video), credits[], impactHighlights[], call-to-action.
- `journey.ts`: title, slug, country, summary, hero media, sections[] with highlights/media, deliverables, attachments.
- `client.ts`: client profile linking to journey references plus metadata.

Use these as-is in a Sanity Studio or adapt to Contentful models with equivalent fields.

## Quality & Performance

- Run `npm run lint`, `npm run typecheck`, `npm run build` before shipping.
- Target Lighthouse >= 90 and LCP < 2.5 s by serving optimized media and keeping hero video lightweight.
- Vercel deployment uses `vercel.json` (build command `npm run build`).

## Next Steps

1. Connect Supabase database tables to match the Sanity client relationships (optional API endpoints).
2. Wire Sanity content fetching in `src/lib/cms/fetchers.ts` once datasets are published.
3. Expand private journeys by querying CMS or Supabase-specific tables.
4. Add automated PDF generation (e.g., via serverless functions) if browser print is insufficient.
