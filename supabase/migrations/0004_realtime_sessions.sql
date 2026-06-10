-- Broadcast clock-in session changes so the council activity feed updates live.
do $$
begin
  alter publication supabase_realtime add table public.clock_in_sessions;
exception
  when duplicate_object then null;
end
$$;
