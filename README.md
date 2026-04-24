# Hessam Health OS

Hessam Health OS is a private health and fitness MVP for daily check-ins, workouts, nutrition, recovery, and AI coaching.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase for database and auth
- OpenAI API for AI coach feedback

## Features in this MVP

- Daily check-in with weight, sleep, energy, soreness, stress, and notes
- Workout tracker with training day type, exercise logging, previous weight visibility, and overload suggestions
- Nutrition tracker with meal-level macro estimates and daily totals
- AI coach with training, nutrition, recovery, tomorrow guidance, and a Persian motivational line
- Dashboard with weight trend, workout frequency, protein average, recovery score, and weekly summary
- Mobile-first layout with Persian-friendly RTL support

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

3. Create the Supabase schema:

- Open your Supabase SQL editor.
- Run [`supabase/schema.sql`](/C:/Users/a/Documents/Codex/2026-04-24/build-a-personal-health-and-fitness/supabase/schema.sql).
- After you create your first auth user, replace the demo UUID in [`supabase/seed.sql`](/C:/Users/a/Documents/Codex/2026-04-24/build-a-personal-health-and-fitness/supabase/seed.sql) with your real `auth.users.id`, then run the seed file.

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Notes

- Without Supabase keys, the app still renders in sample mode using local demo data.
- Without an OpenAI key, the AI coach falls back to a deterministic local coaching response.
- `/login` contains a basic Supabase magic-link flow for private access.

## Suggested folder structure

- `app/` - pages and API routes
- `components/` - dashboard and input forms
- `lib/` - data access, sample data, helpers, and AI coach logic
- `supabase/` - SQL schema and seed files
