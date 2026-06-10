# OneCase — Project Context

Social accountability app: organize work into **Cases** (emoji+color buckets)
containing **Tasks** (progress %). Friends join a case as its **Council**. Core
mechanic: **Clock-In** — pick a duration, live timer, leaving the app = fail,
and the council finds out. Success logs progress; the council sees activity.

The owner (Jason) is a **non-technical product person** — explain things in
plain terms, avoid jargon, and surface decisions rather than assuming.

## Current state (v2 rebuild — working end to end)

This is a ground-up rebuild; the original 2021 app is archived in `legacy/`
(reference only — do not modify). Working today, all on the dev branch:

- Email/password auth (Supabase v2), profile with unique username
- Cases & tasks: full CRUD, animated progress bars
- Clock-in: duration pick → 10s cancel grace → SVG ring timer →
  leave-app-detection fail (AppState) → confetti success / shake fail →
  progress logging (`clock_in_sessions`, `updates`)
- Friends (search/request/accept/remove), council per case
- Notifications: created **server-side by DB triggers** (friend req/accept,
  council add, clock-in success/fail fan-out to council); in-app feed + live
  bell badge via Supabase Realtime
- Council activity feed (live sessions pinned with pulse dot) + Home preview
- Juice pass: springy buttons, staggered list entrances, pull-to-refresh

## Stack & layout

Expo SDK 54 / React Native 0.81 / React 19 · Expo Router (file = screen) ·
NativeWind (Tailwind) · TanStack Query · Supabase (Postgres+Auth+Realtime;
the ONLY backend) · Reanimated 4 (babel plugin is `react-native-worklets/plugin`).

```
app/(auth)/        sign-in, sign-up
app/(app)/         home, case/[id], clock-in/[taskId], edit-*, friends,
                   add-friends, case-council/[id], activity, notifications, profile
src/api/           TanStack Query hooks over Supabase (one file per domain)
src/components/ui/ Button, Input, Avatar, ProgressBar, Confetti, PulseDot, FormScreen
src/lib/           supabase client, auth provider (clears query cache on user switch)
supabase/migrations/  schema + RLS + triggers (apply with `npm run db:push`)
docs/              REBUILD_PLAN.md, SETUP.md, DESIGN_BRIEF.md, UX-WALKTHROUGH.md,
                   design-explorations.html (6-direction v1 board)
```

## Locked product decisions

- **Cheapest viable path**: free tiers only; NO SMS auth (costs per text);
  login = email/password now, Google later, Apple when dev account exists
- Clock-in strictness: **strict by default, user-loosenable** (future setting)
- Analytics: PostHog (not yet added) · Styling: NativeWind · Design: reuse
  brand now, polish later
- Brand tokens: blueberry `#7189FF`, apple `#96DE90`, cerulean `#758ECD`,
  danger `#FF5858`, ink `#1a1a1a`, cream `#FFFCF7` (in tailwind.config.js)

## Working agreements

- Branch: `claude/repo-overview-architecture-upnxxy` — all work pushes here.
  **Always `git pull` before starting; push when a chunk is done.** Remote
  (cloud) Claude sessions share this repo — never leave work uncommitted.
- Build in **feature-sized chunks** the owner can test on his phone after each
  push (he runs `git pull` + Expo Go). He tests; sessions can't see his screen.
- Schema changes = new file in `supabase/migrations/` (never edit applied
  ones); owner applies with `npm run db:push`.
- DB security: RLS everywhere; notifications/social writes happen via
  SECURITY DEFINER triggers, never trusted to the client.
- npm has `legacy-peer-deps=true` (.npmrc) — needed for the RN ecosystem.
  Use `npx expo install <pkg>` for anything Expo/RN so versions match SDK 54.

## Current phase: design exploration

The tool works; it feels static. We're exploring layout/UX directions before
a visual revamp. See `docs/DESIGN_BRIEF.md` (full brief incl. 6 explored
directions A–F and hard UX requirements) and `docs/design-explorations.html`.
**Local sessions have the pencil.dev MCP — use Pencil for design drafting.**

## Known gaps / likely next chunks

- Real lock-screen push + force-quit-proof clock-in (needs Expo dev build +
  heartbeats + scheduled Edge Function — designed in REBUILD_PLAN §8)
- Decline friend requests; tappable notifications (deep links); comments &
  nudges on tasks; onboarding flow; streaks (if direction D elements win)
- `src/lib/database.types.ts` may be a stub — regenerate with
  `npm run generate-types` after schema changes
