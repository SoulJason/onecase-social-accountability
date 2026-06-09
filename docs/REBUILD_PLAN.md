# OneCase — Rebuild Plan

*A ground-up rebuild for a simpler, faster, smoother, more reliable app that's
easy to test and easy to build on.*

This document is written for the product owner. It explains **what** we're
rebuilding, **how** we'll build it, and **in what order** — with the reasoning
in plain terms. Engineers can also use it as the technical north star.

---

## 1. The recommendation in one paragraph

Keep OneCase's two best bets — **Supabase** as the backend and the **existing
data model** — and rebuild everything on top with a modern, current stack:
**Expo (SDK 52+) + Expo Router + TypeScript** on the front end, **Supabase v2**
(database + auth + storage + realtime + Edge Functions) as the *single* backend.
Delete the separate AWS Lambda API entirely. Move the fragile, client-only
"accountability engine" to a **server-authoritative** design so it's reliable.
Add a real testing setup and one-command builds so you can experiment safely and
ship fast.

The result: **one backend instead of three moving parts, a current toolchain,
and a codebase you can actually test and extend.**

---

## 2. What OneCase is (the product in one page)

OneCase is a **social accountability app**. The loop:

1. You organize your life into **Cases** (buckets like "Fitness", "Startup",
   "School") — each with an emoji and color.
2. Inside a case you create **Tasks** (the things you'll actually do).
3. You add **friends** to a case as your **Council** — the people who hold you
   accountable.
4. To work on a task you **Clock In**: you pick a duration, a live timer runs,
   and **if you leave the app you fail** — your council gets notified.
5. Finishing a session logs an **Update** (progress %, time spent). Your council
   sees your progress, can **comment**, and **nudge** you.

The emotional hook is the clock-in: *real* stakes (your friends find out if you
bail). That mechanic is the product. Everything else supports it.

---

## 3. Platform decision: mobile-first (native), not web-first

**Recommendation: stay a native mobile app, built with Expo.**

Why not web-first, even though it would be faster for us to iterate on? The core
mechanic *depends on being a phone app*:

- **"Did you leave the app?"** detection (foreground/background) is native
  behavior. On the web, "leaving" is ambiguous (switching tabs ≠ closing).
- **Push notifications** ("get back or your friends find out") are far more
  reliable and immediate on mobile.
- **Contacts access** (to find friends) is a native capability.

Expo gives us the best of both worlds: it's native, but with a **web-like
developer experience** — instant reload, easy testing, over-the-air updates, and
one-command cloud builds. So we keep the native power *and* the iteration speed.

> If we later want a lightweight web companion (e.g. a read-only "watch your
> friends' progress" page), Expo + React Native Web can share most of the code.
> But the product is mobile.

---

## 4. The recommended stack (and how each piece serves your goals)

| Concern | Choice | Simplicity | Reliability | Speed | Smoothness | Testable |
|---|---|:--:|:--:|:--:|:--:|:--:|
| App framework | **Expo SDK 52+** | ✅ | ✅ | ✅ | | ✅ |
| Navigation | **Expo Router** (file-based) | ✅ | | ✅ | | |
| Language | **TypeScript** (strict) | | ✅ | | | ✅ |
| Backend | **Supabase v2** (one platform) | ✅ | ✅ | ✅ | | |
| Server logic | **Supabase Edge Functions** | ✅ | ✅ | | | |
| Data layer | **TanStack Query** + generated types | | ✅ | ✅ | | ✅ |
| Realtime | **Supabase Realtime** | | ✅ | | ✅ | |
| Animation | **Reanimated 3** + Gesture Handler | | | | ✅ | |
| Styling | **One system** (NativeWind *or* Tamagui) | ✅ | | ✅ | ✅ | |
| Forms | **React Hook Form + Zod** | ✅ | ✅ | | | ✅ |
| Errors/analytics | **Sentry + PostHog** (or keep Mixpanel) | | ✅ | | | |
| Tests | **Jest + RNTL + Maestro** (E2E) | | ✅ | | | ✅ |
| Builds/release | **EAS Build + EAS Update** | ✅ | ✅ | ✅ | | |

**What changes most vs. today, in plain terms:**

- **One backend, not three.** Today the app talks to Supabase *and* a separate
  AWS Lambda API, and uses two analytics/error vendors. We collapse server logic
  into Supabase Edge Functions. Fewer things to run, pay for, and break.
- **File-based navigation.** Adding a screen becomes "add a file," not "wire it
  into a 800-line navigator." (Today's `SignInStack.tsx` is ~800 lines of
  repetitive screen config — see it for yourself.)
- **Types generated from the database.** The shape of your data is defined once
  (in Postgres) and flows automatically into the app, so whole classes of bugs
  disappear before you run anything.
- **One styling system.** Today there are several overlapping ones
  (`react-native-extended-stylesheet`, `react-native-elements`,
  `react-native-paper`, inline styles). We pick one.

---

## 5. The "one backend" simplification

Today:

```
App ──▶ Supabase           (data, auth, storage — 95% of traffic)
App ──▶ AWS Lambda/Express  (login, reset-password OTP, "you failed" push)
```

The Lambda API exists for only a handful of things. We fold all of them into
Supabase:

| Old Lambda endpoint | New home |
|---|---|
| `/login` (username→email/phone lookup) | Supabase Auth + a tiny RPC, or Edge Function |
| `/reset-password` (send OTP) | Supabase Auth OTP (built in) |
| `/verify` (verify OTP) | Supabase Auth (built in) |
| `/fail-notification` (push when you bail) | **Edge Function + scheduled job** (see §8) |

After:

```
App ──▶ Supabase (database, auth, storage, realtime, edge functions)
```

**Why this matters to you:** one dashboard, one bill, one place to look when
something's wrong, and no AWS deployment to maintain. This is the single biggest
simplicity win in the rebuild.

---

## 6. Data model — reuse, with targeted upgrades

The existing schema (`database.sql`) is genuinely good and we keep its shape:

- `users` (profiles) · `user_relationships` (friendships) · `cases` ·
  `users_cases` (council membership) · `tasks` · `updates` (progress log) ·
  `clock_ins` (work sessions) · `task_comments` (threaded) · `notifications` ·
  `user_roles` / `role_permissions` (RBAC).

**Upgrades we make:**

1. **Row-Level Security (RLS) everywhere, done right.** This is what lets the
   app talk to the database *directly* but safely — each user can only read/write
   what they're allowed to. We treat this as a first-class, tested part of the
   build, not an afterthought.
2. **A real `clock_in_sessions` model** that is the *source of truth* for the
   accountability engine (see §8) — with `started_at`, `planned_seconds`,
   `status` (`live` / `succeeded` / `failed` / `cancelled`), and `last_heartbeat_at`.
3. **Generated TypeScript types** from the schema, so the app and database can
   never silently disagree.
4. **Light cleanup:** consistent `snake_case` columns mapped to `camelCase` once
   in a single typed data layer (today this conversion is sprinkled around).

No risky data migration is required to *start* — we can stand up a fresh Supabase
project from the schema and evolve it.

---

## 7. Feature inventory (what we're rebuilding)

Grouped by area, mapped from today's ~50 screens. This is the scope.

**A. Accounts & Auth**
- Welcome / landing
- Sign up (name → username → password → phone verify)
- Username generation + availability check
- Log in (by username, email, or phone)
- Password reset (via email or phone OTP)
- Delete account

**B. Onboarding**
- Profile picture (capture/upload + confirm)
- Contacts permission + find friends from contacts

**C. Home & Navigation**
- Home feed (your cases / council activity)
- Friends list
- Profile
- Notifications (with unread badge)
- Side menu (settings, add friends, sign out)

**D. Cases**
- Create / edit / reorder cases (emoji, color, title)
- Select a case
- Case detail with its tasks

**E. Tasks**
- Create / edit / preview a task
- Assign a task to a friend (+ pick the case)
- Task detail (progress, updates, comments)
- Task progress history

**F. The Accountability Engine (Clock-In)** — see §8
- Pick duration → clock in → live timer
- 10-second "cancel" grace window
- Leave-the-app detection → fail
- Clock out early ("give up") → notify council
- Success/failure result screen → log an Update

**G. Council & Social**
- Assign a council to a case
- Add friends / friend requests (send, accept, view)
- User profiles
- Comments (threaded) on tasks
- Nudges
- Notifications for: assign task, add/accept council, add/accept friend, nudge,
  comment, comment reply

**H. Settings & Profile**
- Edit profile, change username
- Settings, delete account
- Push-notification token registration

---

## 8. The accountability engine — the part we must get right

This is the heart of the product and, today, the **most fragile code in the
repo** (`src/components/Countdown.tsx`). The current design:

- Lives entirely on the phone, driven by `AppState` transitions.
- Uses brittle heuristics — e.g. a `100ms` threshold to *guess* whether you
  "put your phone to sleep" vs. "left the app."
- Has multiple commented-out alternative implementations and version-dependent
  TODOs.
- Fires a fire-and-forget HTTP POST to mark a failure, with the catch block
  silently swallowing errors.
- Has **no server source of truth** — if the app is killed, state is lost.

**The rebuild: a server-authoritative session.**

```
Clock In  ──▶ create clock_in_session { status: live, planned_seconds, started_at }
Phone     ──▶ sends a heartbeat every few seconds (updates last_heartbeat_at)
Leaves app──▶ heartbeats stop
Server    ──▶ a scheduled job sees "live session, stale heartbeat" → status: failed
Failure   ──▶ Edge Function notifies the council (push)
Success   ──▶ session reaches planned_seconds with heartbeats intact → succeeded → log Update
```

**Why this is better for every one of your goals:**

- **Reliable:** the *server* decides success/failure from facts (heartbeats), not
  fragile phone-state guesses. Killing the app can't cheat the system.
- **Simple:** the phone's job shrinks to "show a timer, send heartbeats." Much
  less tricky client code.
- **Smooth:** the on-screen countdown is driven locally by Reanimated for buttery
  animation, while correctness is guaranteed by the server — best of both.
- **Testable:** "did the user fail?" becomes a pure server rule we can unit-test,
  instead of something that only reproduces by physically backgrounding a phone.

> Honest trade-off to decide together: how strict is "left the app"? Options
> range from lenient (brief glances allowed) to strict (any background = fail).
> This is a *product* dial we'll expose as a setting, not a hardcoded heuristic.

---

## 9. "Bouncy & smooth" — the UX/performance approach

Smoothness isn't an accident; it comes from specific choices:

- **Reanimated 3 + Gesture Handler** run animations on the UI thread, so they
  stay at 60–120fps even when JavaScript is busy. Timers, progress bars,
  transitions, the bottom sheet, swipes — all buttery.
- **Optimistic updates** (via TanStack Query): when you tap "done" or post a
  comment, the UI updates *instantly* and reconciles with the server in the
  background. The app feels immediate, never laggy.
- **Realtime** (Supabase): your council's progress and comments appear live,
  without pull-to-refresh.
- **Skeletons over spinners:** content-shaped loading states (the repo already
  has the idea — `TaskListSkeleton`) so nothing "pops."
- **One styling system + a small design-token set** (colors, spacing, type)
  for visual consistency and effortless theming/dark mode later.
- **Haptics** on key moments (clock in, success, fail) for tactile delight.

---

## 10. Easy to test, easy to build on

This is an explicit goal, so it gets first-class treatment.

**Testing pyramid:**
- **Unit tests (Jest):** pure logic — the accountability rules, progress math,
  username sanitizing, date/time helpers. Fast, run on every save.
- **Component tests (React Native Testing Library):** screens render and respond
  to taps correctly, with Supabase mocked.
- **End-to-end (Maestro):** a handful of real user flows on a simulator —
  "sign up → create case → clock in → succeed." Maestro flows are simple YAML,
  readable by non-engineers.
- **Database/RLS tests:** verify users can only see what they should.

**Developer experience (so you and any engineer can move fast):**
- **Clear, conventional folder structure** (feature-first), documented.
- **Strict TypeScript + ESLint + Prettier**, enforced automatically — the
  computer catches mistakes, not code review.
- **`.env.example` + a single setup script** → clone to running in minutes
  (the revival already started this).
- **Seed script** to populate a dev database with fake users/cases/tasks so you
  can play immediately, without manual data entry.
- **Storybook (optional):** a visual catalog of components to design in isolation.

**Builds & releases (so experimenting is safe and shipping is one command):**
- **EAS Build:** cloud builds for iOS/Android — no Mac/Xcode wrangling required.
- **EAS Update:** push JS-only changes over-the-air, so most tweaks reach your
  phone in seconds without an app-store review.
- **Preview builds per change:** every meaningful change can produce a shareable
  build you can tap through before it's "real."
- **CI (GitHub Actions):** run tests + type-check on every push, so `main` stays
  green and trustworthy.

---

## 11. Security & secrets (fix on day one)

The current repo has **secrets committed in plaintext** — Supabase keys, a Sentry
auth token, and Mixpanel setup live in `app.json` and `serverless.yml`. As part
of the rebuild:

- **Rotate** all of those keys (assume they're compromised since they're in git
  history).
- Move every secret to **environment variables / EAS Secrets**, never committed.
- Lean on **Supabase RLS** so the app's public key can't be abused.
- Add **secret scanning** to CI to prevent regressions.

---

## 12. Phased roadmap

Each phase ends with something you can *touch*, so we de-risk continuously rather
than disappearing for months.

**Phase 0 — Foundations (small).**
New Expo + TypeScript + Expo Router project; design tokens; lint/format/CI;
fresh Supabase project from the schema with RLS; generated types; seed script.
*Outcome: an empty but professional app shell you can run, plus a safe database.*

**Phase 1 — Auth & onboarding.**
Sign up, log in, password reset, profile picture, contacts.
*Outcome: you can create an account and land on an (empty) home screen.*

**Phase 2 — Cases & tasks (no social yet).**
Create/edit cases and tasks; task detail; progress history.
*Outcome: a solo productivity app you can actually use.*

**Phase 3 — The accountability engine.**
Server-authoritative clock-in, live timer, success/fail, Updates log.
*Outcome: the core mechanic works and is reliable. This is the heartbeat of OneCase.*

**Phase 4 — Social layer.**
Friends, council, comments, nudges, notifications, realtime council activity.
*Outcome: the full social-accountability loop.*

**Phase 5 — Polish & ship.**
Animations/haptics pass, dark mode, empty/error states, E2E tests, store builds.
*Outcome: a smooth, shippable app.*

We can reorder — e.g. if you want to demo the clock-in first, we can pull a
vertical slice of it forward. Phases are a guide, not a cage.

---

## 13. What we delete (less is more)

- The **entire AWS Lambda/Serverless API** (folded into Supabase).
- **Duplicate UI libraries** (`react-native-elements` + `react-native-paper` +
  `extended-stylesheet` + inline) → one system.
- **Dead/commented-out code** (the old navigator, the multiple clock-in
  attempts, commented schema tables).
- **One of the two analytics/error stacks** (Sentry + Mixpanel today → Sentry +
  one product-analytics tool).
- **Manual snake↔camel conversion** scattered around → one typed data layer.

---

## 14. Open product decisions (your call)

These shape the build; none block starting Phase 0:

1. **"Leave the app" strictness** — lenient, strict, or user-configurable? (§8)
2. **Analytics tool** — keep Mixpanel, or move to PostHog (open-source, generous
   free tier)?
3. **Styling system** — NativeWind (Tailwind-style, familiar) vs. Tamagui
   (fastest, built-in theming). I lean NativeWind for simplicity.
4. **Auth identifiers** — keep username + phone + email, or simplify to one
   primary (e.g. phone) to reduce edge cases?
5. **Brand refresh** — reuse the current visual identity, or redesign the look as
   part of this?

---

## 15. Suggested first step

Start **Phase 0**. It's low-risk, produces a running app shell + a clean database
you can poke at, and establishes the testing/build pipeline that makes
everything after it fast and safe. From there we build the vertical slices in
the order above (or reordered to whatever you most want to demo first).

When you're ready, I can scaffold Phase 0 directly in this repo.
