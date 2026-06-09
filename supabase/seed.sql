-- Seed data for local development (`supabase db reset` runs this automatically).
--
-- NOTE: profiles are normally created by a trigger when an auth user signs up.
-- For a self-contained local seed we insert a few auth users directly, then the
-- trigger fills in profiles, and we flesh them out and add demo content.

-- Demo auth users (local only). Password for all: "password123".
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
values
  ('11111111-1111-1111-1111-111111111111', 'jordan@example.com', crypt('password123', gen_salt('bf')), now(), '{"name":"Jordan Diaz"}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'sam@example.com',    crypt('password123', gen_salt('bf')), now(), '{"name":"Sam Kim"}',    'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'aisha@example.com',  crypt('password123', gen_salt('bf')), now(), '{"name":"Aisha Mensah"}','authenticated', 'authenticated')
on conflict (id) do nothing;

-- Flesh out the auto-created profiles.
update public.profiles set username = 'jordan', first_name = 'Jordan', last_name = 'Diaz'  where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set username = 'sam',    first_name = 'Sam',    last_name = 'Kim'   where id = '22222222-2222-2222-2222-222222222222';
update public.profiles set username = 'aisha',  first_name = 'Aisha',  last_name = 'Mensah' where id = '33333333-3333-3333-3333-333333333333';

-- Jordan and Sam are friends.
insert into public.friendships (user_low, user_high, status, requested_by)
values ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'accepted', '11111111-1111-1111-1111-111111111111')
on conflict do nothing;

-- A case owned by Jordan, with Sam on the council.
insert into public.cases (id, owner_id, title, emoji, color, position)
values (1, '11111111-1111-1111-1111-111111111111', 'Fitness', '💪', '#96DE90', 0)
on conflict do nothing;

insert into public.case_members (case_id, user_id)
values (1, '22222222-2222-2222-2222-222222222222')
on conflict do nothing;

-- A couple of tasks.
insert into public.tasks (id, case_id, created_by, title, description, progress)
values
  (1, 1, '11111111-1111-1111-1111-111111111111', 'Run 3 miles', 'Easy zone-2 pace', 40),
  (2, 1, '11111111-1111-1111-1111-111111111111', 'Stretch 10 min', null, 0)
on conflict do nothing;
