-- Broadcast notification inserts in real time so the bell updates instantly.
-- (Tables must be in the supabase_realtime publication to emit change events.)
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end
$$;
