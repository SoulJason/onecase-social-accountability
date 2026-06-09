# OneCase

**Social accountability with friends.** Commit to tasks, clock in with a live
timer, and let your council keep you honest — leave the app mid-session and you
fail, and your friends find out.

This is the **v2 rebuild**. See [`docs/REBUILD_PLAN.md`](docs/REBUILD_PLAN.md)
for the full plan and [`docs/SETUP.md`](docs/SETUP.md) to get it running.

## Tech stack

- **App:** Expo (SDK 52) + Expo Router + TypeScript
- **Styling:** NativeWind (Tailwind for React Native)
- **Backend:** Supabase (Postgres + Auth + Storage + Realtime + Edge Functions)
- **Data layer:** TanStack Query
- **Auth:** Google · Apple · email + password (no SMS)
- **Analytics/errors:** PostHog · Sentry *(added later)*

## Project layout

```
app/                 Expo Router routes (file = screen)
  _layout.tsx        Root providers (Query, gestures, safe-area)
  index.tsx          Landing
src/
  components/ui/     Reusable UI primitives
  lib/               supabase client + generated DB types
  theme/             design tokens
supabase/
  migrations/        SQL schema (with Row-Level Security)
  seed.sql           demo data for local dev
docs/                rebuild plan, setup guide, clock-in demo
legacy/              the original v1 app, archived for reference
```

## Quick start

```bash
npm install            # or: yarn
npx expo install --fix # align native deps to the Expo SDK
cp .env.example .env    # then paste your Supabase URL + anon key
npm start              # open in Expo Go / a simulator
```

Full walkthrough (including the free accounts you'll need) is in
[`docs/SETUP.md`](docs/SETUP.md).

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run db:push` | Apply migrations to your Supabase project |
| `npm run generate-types` | Regenerate `src/lib/database.types.ts` from the DB |
