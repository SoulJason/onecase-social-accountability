# OneCase — Design Brief (for Pencil sessions)

> Context handoff: read this fully before drafting. The goal right now is
> **layout & UX exploration** — many distinct variants the product owner can
> pick between and iterate on. Don't fixate on final colors/copy.

## What OneCase is

A social accountability app. Users organize work into **Cases** (buckets with
emoji + color), each containing **Tasks** (with progress %). Friends join a
case as its **Council**. The core mechanic is the **Clock-In**: pick a
duration, a live timer runs, and **leaving the app = failing** — your council
gets notified you bailed. Success logs progress and the council sees it.
The product's emotion is *stakes*: tension while clocked in, triumph on
success, shame on failure.

## Current state

A working React Native (Expo) app exists with: email auth, cases/tasks CRUD,
the clock-in (timer ring, confetti on success, shake on fail), friends +
council, in-app notifications, and a live "council activity" feed. It works
but reads as a plain utility — the redesign should make it feel alive and
opinionated.

## What to draft

For each direction explored, mock these screens (phone, portrait, 390×844):

1. **Home** — the most important decision: what do you see first?
2. **Case detail** — a case's tasks + council
3. **Clock-In** — 4 states: pick duration → grace countdown (cancellable 10s)
   → locked in (tension!) → success / fail results
4. **Activity feed** — what friends are doing; live sessions are special
5. (Optional) Notifications, Profile, Friends

## Six directions already explored (v1 board: docs/design-explorations.html)

| # | Name | Core bet | First thing you see |
|---|------|----------|---------------------|
| A | Tab Bar Classic | Familiarity; cases-first + live strip | Your cases |
| B | Feed-First Social | Friends ARE the app; story rings for live | Friends' activity |
| C | Focus Ritual | Opening the app IS starting a session | A ready timer |
| D | Coach & Game | Streaks/XP/quests; failure costs streak | Your streak + quest |
| E | Clean Pro | Quiet typographic tool for planners | Today checklist |
| F | Today Card Stack | One next action at a time, swipeable | A single task card |

The structural question: **me-first (A/E/F) vs friends-first (B) vs
timer-first (C) vs habit-first (D)**. New variants can mix elements (e.g. B's
live story rings + A's tab bar + C's clock-in screen).

## Existing brand tokens (fine to evolve)

- Blueberry `#7189FF` (primary) · Apple green `#96DE90` (success/action)
- Cerulean `#758ECD` · Danger `#FF5858` · Ink `#1a1a1a` · Cream `#FFFCF7` (bg)
- Rounded-2xl cards (radius ~16–24), white cards on cream
- Avatar = colored circle with initial; cases = emoji on colored rounded tile

## Hard UX requirements (keep in every variant)

- Clock-in must show: duration choice, a 10s cancel grace, a tense
  locked-in state, and dramatic success/fail moments
- Live friend sessions ("clocked in RIGHT NOW") deserve special treatment —
  pulsing red dot / ring is the current convention
- A notification entry point with unread count
- Creating a case/task should never be more than 2 taps from Home
- One-handed phone use; primary action reachable by thumb

## Engineering constraints (so designs translate 1:1)

- React Native + Expo, styled with NativeWind (Tailwind classes)
- Animations: Reanimated (springs, timing, SVG ring) — motion is cheap, use it
- No custom fonts yet (system font); icons currently emoji — proposing an
  icon set is welcome
- Bottom tab bar, stacks, and modals are all easy; exotic gesture-driven
  navigation is possible but costs more

## Process

Produce variants → the owner picks/mixes → iterate deeper on 1–2 winners
(all screens) → the winning design gets implemented in the real app
(repo root, `app/` + `src/components/ui/`).
