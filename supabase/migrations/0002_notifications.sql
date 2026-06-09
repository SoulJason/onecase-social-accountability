-- Notifications: server-side triggers that create notification rows on key
-- events. Created by SECURITY DEFINER trigger functions so they bypass RLS
-- (a client can never fabricate a notification for someone else).
--
-- Apply with: npm run db:push

-- New event types + a human-readable message column.
alter type public.notification_type add value if not exists 'clock_in_failed';
alter type public.notification_type add value if not exists 'clock_in_succeeded';

alter table public.notifications add column if not exists message text;

-- Helper: a display name for a profile.
create or replace function public.display_name(p_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    nullif(trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), ''),
    '@' || username,
    'Someone'
  )
  from public.profiles
  where id = p_id;
$$;

-- Friend request sent → notify the other person.
create or replace function public.on_friendship_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient uuid;
begin
  recipient := case when new.requested_by = new.user_low then new.user_high else new.user_low end;
  insert into public.notifications (recipient_id, sender_id, type, message)
  values (
    recipient,
    new.requested_by,
    'add_friend',
    public.display_name(new.requested_by) || ' sent you a friend request'
  );
  return new;
end;
$$;

create trigger trg_friendship_insert
  after insert on public.friendships
  for each row
  when (new.status = 'pending')
  execute function public.on_friendship_insert();

-- Friend request accepted → notify the original requester.
create or replace function public.on_friendship_accept()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  accepter uuid;
begin
  accepter := case when new.requested_by = new.user_low then new.user_high else new.user_low end;
  insert into public.notifications (recipient_id, sender_id, type, message)
  values (
    new.requested_by,
    accepter,
    'accept_friend',
    public.display_name(accepter) || ' accepted your friend request'
  );
  return new;
end;
$$;

create trigger trg_friendship_accept
  after update on public.friendships
  for each row
  when (new.status = 'accepted' and old.status is distinct from 'accepted')
  execute function public.on_friendship_accept();

-- Added to a council → notify the added user.
create or replace function public.on_case_member_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  c_owner uuid;
  c_title text;
begin
  select owner_id, title into c_owner, c_title from public.cases where id = new.case_id;
  if c_owner = new.user_id then
    return new;
  end if;
  insert into public.notifications (recipient_id, sender_id, type, case_id, message)
  values (
    new.user_id,
    c_owner,
    'add_council',
    new.case_id,
    public.display_name(c_owner) || ' added you to their council for "' || coalesce(c_title, 'a case') || '"'
  );
  return new;
end;
$$;

create trigger trg_case_member_insert
  after insert on public.case_members
  for each row
  execute function public.on_case_member_insert();

-- Clock-in finished (succeeded/failed) → notify the council of that case.
create or replace function public.on_session_result()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  t_title text;
  c_id bigint;
  ntype public.notification_type;
  verb text;
  rec record;
begin
  select title, case_id into t_title, c_id from public.tasks where id = new.task_id;

  if new.status = 'failed' then
    ntype := 'clock_in_failed';
    verb := ' bailed on "';
  else
    ntype := 'clock_in_succeeded';
    verb := ' crushed "';
  end if;

  for rec in
    select user_id as uid from public.case_members where case_id = c_id and user_id <> new.user_id
    union
    select owner_id as uid from public.cases where id = c_id and owner_id <> new.user_id
  loop
    insert into public.notifications (recipient_id, sender_id, type, case_id, task_id, message)
    values (
      rec.uid,
      new.user_id,
      ntype,
      c_id,
      new.task_id,
      public.display_name(new.user_id) || verb || coalesce(t_title, 'a task') || '"'
    );
  end loop;
  return new;
end;
$$;

create trigger trg_session_result
  after update on public.clock_in_sessions
  for each row
  when (new.status in ('failed', 'succeeded') and old.status = 'live')
  execute function public.on_session_result();
