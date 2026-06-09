-- OneCase v2 — initial schema
--
-- Modernized from the legacy schema (see legacy/database.sql). Key changes:
--   * `profiles` mirrors auth.users (auto-created via trigger on signup)
--   * Row-Level Security (RLS) enabled on every table with explicit policies
--   * New server-authoritative `clock_in_sessions` (the accountability engine)
--   * No phone/SMS-specific columns (login is Google/Apple/email — see rebuild plan)
--
-- Apply with the Supabase CLI: `supabase db push` (cloud) or `supabase db reset` (local).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.friendship_status as enum ('pending', 'accepted', 'blocked');
create type public.session_status as enum ('live', 'succeeded', 'failed', 'cancelled');
create type public.notification_type as enum (
  'assign_task', 'add_council', 'accept_council',
  'add_friend', 'accept_friend', 'nudge', 'comment', 'comment_reply'
);

-- ---------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  username    text unique,
  first_name  text,
  last_name   text,
  avatar_url  text,
  -- Optional, user-entered, NOT SMS-verified. Used only for contacts matching.
  phone       text,
  push_token  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.profiles is 'Public profile per user, keyed to auth.users.';

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- friendships
-- ---------------------------------------------------------------------------
create table public.friendships (
  user_low    uuid not null references public.profiles on delete cascade,
  user_high   uuid not null references public.profiles on delete cascade,
  status      friendship_status not null default 'pending',
  -- who sent the original request (matters while status = 'pending')
  requested_by uuid not null references public.profiles on delete cascade,
  created_at  timestamptz not null default now(),
  -- store each pair once, ordered, so (a,b) and (b,a) can't both exist
  check (user_low < user_high),
  primary key (user_low, user_high)
);

-- ---------------------------------------------------------------------------
-- cases  (buckets of work, each with a council)
-- ---------------------------------------------------------------------------
create table public.cases (
  id          bigint generated always as identity primary key,
  owner_id    uuid not null references public.profiles on delete cascade,
  title       text not null,
  emoji       text not null,
  color       text not null,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

-- council membership (friends attached to a case)
create table public.case_members (
  case_id     bigint not null references public.cases on delete cascade,
  user_id     uuid not null references public.profiles on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (case_id, user_id)
);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table public.tasks (
  id          bigint generated always as identity primary key,
  case_id     bigint not null references public.cases on delete cascade,
  created_by  uuid not null references public.profiles on delete cascade,
  assigned_to uuid references public.profiles on delete set null,
  title       text not null,
  description text,
  progress    real not null default 0,  -- 0..100
  created_at  timestamptz not null default now()
);

-- progress log entries
create table public.updates (
  id           bigint generated always as identity primary key,
  task_id      bigint not null references public.tasks on delete cascade,
  created_by   uuid not null references public.profiles on delete cascade,
  old_progress real not null,
  new_progress real not null,
  seconds_spent int,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- clock_in_sessions  (the server-authoritative accountability engine)
-- ---------------------------------------------------------------------------
create table public.clock_in_sessions (
  id               bigint generated always as identity primary key,
  task_id          bigint not null references public.tasks on delete cascade,
  user_id          uuid not null references public.profiles on delete cascade,
  planned_seconds  int not null,
  strict           boolean not null default true,
  status           session_status not null default 'live',
  started_at       timestamptz not null default now(),
  last_heartbeat_at timestamptz not null default now(),
  ended_at         timestamptz
);
comment on table public.clock_in_sessions is
  'Source of truth for clock-ins. The client sends heartbeats; a scheduled job '
  'fails live sessions whose heartbeat goes stale (user left the app).';

create index clock_in_sessions_live_idx
  on public.clock_in_sessions (status, last_heartbeat_at)
  where status = 'live';

-- ---------------------------------------------------------------------------
-- comments (threaded) + notifications
-- ---------------------------------------------------------------------------
create table public.task_comments (
  id          bigint generated always as identity primary key,
  task_id     bigint not null references public.tasks on delete cascade,
  created_by  uuid not null references public.profiles on delete cascade,
  parent_id   bigint references public.task_comments on delete cascade,
  message     text not null,
  created_at  timestamptz not null default now()
);

create table public.notifications (
  id              bigint generated always as identity primary key,
  recipient_id    uuid not null references public.profiles on delete cascade,
  sender_id       uuid not null references public.profiles on delete cascade,
  type            notification_type not null,
  is_read         boolean not null default false,
  case_id         bigint references public.cases on delete cascade,
  task_id         bigint references public.tasks on delete cascade,
  comment_id      bigint references public.task_comments on delete cascade,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper: is the current user a member of (or owner of) a case?
-- ---------------------------------------------------------------------------
create function public.is_case_member(target_case bigint)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.cases c where c.id = target_case and c.owner_id = auth.uid()
  ) or exists (
    select 1 from public.case_members m where m.case_id = target_case and m.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.friendships         enable row level security;
alter table public.cases              enable row level security;
alter table public.case_members        enable row level security;
alter table public.tasks              enable row level security;
alter table public.updates            enable row level security;
alter table public.clock_in_sessions   enable row level security;
alter table public.task_comments       enable row level security;
alter table public.notifications       enable row level security;

-- profiles: anyone signed in can read profiles (needed to show friends/council);
-- you may only edit your own.
create policy "profiles are readable by authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "users update own profile"
  on public.profiles for update to authenticated using (id = auth.uid());

-- friendships: you can see/manage rows you're part of.
create policy "see own friendships"
  on public.friendships for select to authenticated
  using (auth.uid() in (user_low, user_high));
create policy "create own friendships"
  on public.friendships for insert to authenticated
  with check (auth.uid() in (user_low, user_high) and requested_by = auth.uid());
create policy "update own friendships"
  on public.friendships for update to authenticated
  using (auth.uid() in (user_low, user_high));
create policy "delete own friendships"
  on public.friendships for delete to authenticated
  using (auth.uid() in (user_low, user_high));

-- cases: owner or council member can read; only the owner can write.
create policy "members read cases"
  on public.cases for select to authenticated using (public.is_case_member(id));
create policy "owner writes cases"
  on public.cases for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- case_members: members can read; only the case owner can add/remove.
create policy "members read membership"
  on public.case_members for select to authenticated using (public.is_case_member(case_id));
create policy "owner manages membership"
  on public.case_members for all to authenticated
  using (exists (select 1 from public.cases c where c.id = case_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from public.cases c where c.id = case_id and c.owner_id = auth.uid()));

-- tasks / updates / comments: visible to anyone on the case.
create policy "members read tasks"
  on public.tasks for select to authenticated using (public.is_case_member(case_id));
create policy "members write tasks"
  on public.tasks for all to authenticated
  using (public.is_case_member(case_id)) with check (public.is_case_member(case_id));

create policy "members read updates"
  on public.updates for select to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_id and public.is_case_member(t.case_id)));
create policy "author writes updates"
  on public.updates for insert to authenticated with check (created_by = auth.uid());

create policy "members read comments"
  on public.task_comments for select to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_id and public.is_case_member(t.case_id)));
create policy "author writes comments"
  on public.task_comments for insert to authenticated with check (created_by = auth.uid());
create policy "author edits comments"
  on public.task_comments for update to authenticated using (created_by = auth.uid());
create policy "author deletes comments"
  on public.task_comments for delete to authenticated using (created_by = auth.uid());

-- clock-in sessions: you manage your own; council can read sessions on shared cases.
create policy "own sessions"
  on public.clock_in_sessions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "council reads sessions"
  on public.clock_in_sessions for select to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_id and public.is_case_member(t.case_id)));

-- notifications: only the recipient can read / mark read.
create policy "read own notifications"
  on public.notifications for select to authenticated using (recipient_id = auth.uid());
create policy "update own notifications"
  on public.notifications for update to authenticated using (recipient_id = auth.uid());
