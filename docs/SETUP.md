# Phase 0 — Setup Guide

This gets the v2 app running on your phone and stands up your database. It's
written to be followed step by step; the parts that need *your* accounts are
called out clearly.

Everything here uses **free tiers**. The only paid items (Apple $99/yr, Google
Play $25 once) are **not** needed until you publish to the app stores — you can
do all of this and run the app on your phone for **$0**.

---

## What I (Claude) already scaffolded

- The Expo + Expo Router + TypeScript app shell (`app/`, `src/`)
- NativeWind styling + design tokens
- Supabase client wiring (`src/lib/supabase.ts`)
- The database schema with Row-Level Security (`supabase/migrations/0001_init.sql`)
- Demo seed data (`supabase/seed.sql`)
- Lint / format / type-check / CI

## What needs you (about 20–30 min, one time)

You'll create one free account (Supabase) and run a few commands. Social login
(Google/Apple) can wait until Phase 1 — email/password works immediately.

### 1. Install the tools

```bash
# Node 20+ recommended. Then, from the repo root:
npm install
npx expo install --fix     # aligns native deps to the Expo SDK exactly
```

> `expo install --fix` is important: it pins every Expo/React-Native package to
> the versions that match the SDK, so you never fight version mismatches.

### 2. Create a free Supabase project  ← *needs you*

1. Go to https://supabase.com and sign up (free).
2. Create a new project. Pick a region near you. Save the database password.
3. In **Project Settings → API**, copy the **Project URL** and the **anon
   public** key.

### 3. Connect the app to Supabase

```bash
cp .env.example .env
```

Paste your values into `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

### 4. Create the database tables

Install the Supabase CLI (https://supabase.com/docs/guides/cli), then:

```bash
supabase login
supabase link --project-ref YOUR-PROJECT-REF   # the ref is in your project URL
npm run db:push                                 # applies supabase/migrations
npm run generate-types                          # real DB types -> src/lib/database.types.ts
```

> Prefer not to use the CLI yet? You can instead paste the contents of
> `supabase/migrations/0001_init.sql` into the Supabase **SQL Editor** and run
> it. (You'd then skip `generate-types` until you set up the CLI.)

### 5. Run it

```bash
npm start
```

Then:
- Install **Expo Go** on your phone (App Store / Play Store)
- Scan the QR code from the terminal
- You should see the OneCase landing screen 🎉

---

## Turning on Google / Apple sign-in (Phase 1, optional now)

When we build auth, these are configured in the Supabase dashboard under
**Authentication → Providers** — both are **free**:

- **Google:** create an OAuth client in Google Cloud Console (free), paste the
  client ID/secret into Supabase.
- **Apple:** requires the Apple Developer Program ($99/yr) — so we'll wire Google
  + email first, and add Apple when you're ready to ship to iOS.

I'll walk you through each when we get there.

---

## Troubleshooting

- **"Missing EXPO_PUBLIC_SUPABASE_URL" warning** → your `.env` isn't filled in,
  or you need to restart `npm start` after editing it.
- **Styles not applying** → stop and restart the dev server so NativeWind
  rebuilds; make sure you didn't remove the `import "../global.css"` in
  `app/_layout.tsx`.
- **Type errors about tables** → run `npm run generate-types` after the schema
  exists; until then `database.types.ts` is an empty stub on purpose.

---

## Definition of done for Phase 0

- [ ] App launches in Expo Go and shows the landing screen
- [ ] `.env` connects to your Supabase project
- [ ] Schema applied; tables visible in the Supabase Table Editor
- [ ] `npm run typecheck` and `npm run lint` pass

Once these are checked, we move to **Phase 1: auth & onboarding**.
