create table public.daily_checkins (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null default current_date,
  prayer boolean not null default false,
  pushups integer not null default 0 check (pushups between 0 and 10000),
  steps integer check (steps between 0 and 200000),
  calendar_done text[] not null default '{}' check (cardinality(calendar_done) <= 500),
  updated_at timestamptz not null default now(),
  primary key (user_id,date)
);
alter table public.daily_checkins enable row level security;
grant select,insert,update,delete on public.daily_checkins to authenticated;
create policy daily_checkins_select_own on public.daily_checkins for select to authenticated using ((select auth.uid()) = user_id);
create policy daily_checkins_insert_own on public.daily_checkins for insert to authenticated with check ((select auth.uid()) = user_id);
create policy daily_checkins_update_own on public.daily_checkins for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy daily_checkins_delete_own on public.daily_checkins for delete to authenticated using ((select auth.uid()) = user_id);
