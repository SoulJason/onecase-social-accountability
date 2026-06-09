# OneCase Mobile

**Social Accountability With Friends** — a React Native mobile app where you
commit to tasks, "clock in" to work on them with a live timer, and your friends
(your "council") keep you accountable. Leave the app mid-session and you
auto-clock-out — and your friends get notified you bailed.

## Technology

- **Mobile app:** React Native + Expo (SDK 41), TypeScript
- **Backend:** Supabase (Postgres database, Auth, Storage) — the app talks to it directly
- **Custom API:** Serverless Framework on AWS Lambda (Node/Express) for custom
  login, password-reset OTP, and "you failed" push notifications (see `serverless/`)
- **Other:** React Query (data layer), Sentry (crash reporting), Mixpanel (analytics), Expo Notifications (push)

## Project layout

```
src/
  screens/      ~50 screens (auth, onboarding, cases, tasks, council, etc.)
  components/    Reusable UI
  queries/      Data reads (React Query hooks over Supabase)
  mutations/    Data writes (React Query hooks over Supabase)
  lib/supabase/ Supabase client + data-access helpers
  navigation/   React Navigation stacks/tabs
  providers/    User/auth + analytics context
database.sql    Full Postgres schema (run this against a Supabase project)
serverless/     AWS Lambda API
```

## Local development setup

> Requires Node.js, Yarn, and the Expo tooling. To run on a device, install the
> **Expo Go** app (note: this project targets the SDK 41 era; a modern Expo Go
> may not load it — see "Known constraints" below).

1. Clone the repository
2. From the repo root, run `yarn` to install dependencies
3. Copy `.env.example` to `.env` and fill in your Supabase values
4. Run `yarn start` to start the Expo dev server
5. Open the app in the iOS Simulator (`i`), Android emulator (`a`), or Expo Go

### Backend (Supabase)

The app needs a Supabase project. To stand up a fresh one:

1. Create a project at https://supabase.com
2. Run `database.sql` in the Supabase SQL editor to create the schema
3. Put the project URL and anon key into `.env` (the `*_DEV` vars are used in
   local development)

## Known constraints

This codebase targets a 2021-era stack (Expo SDK 41, React Native 0.63,
React 16, `@supabase/supabase-js` v1). Modern Expo Go and tooling may not run it
unmodified; getting it running locally may require matching legacy tooling, and
a from-scratch modernization is recommended for ongoing development.
