-- Personal scheduling context, protected by existing profiles owner RLS.
alter table public.profiles
  add column if not exists planning_constraints text not null default ''
  check (char_length(planning_constraints) <= 3000);
