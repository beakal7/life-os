-- Life OS initial schema
create schema if not exists private;

create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  vision text, top3 text[] not null default '{"","",""}', week3 text[] not null default '{"","",""}',
  focus_minutes int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "profiles_delete_own" on public.profiles for delete to authenticated using ((select auth.uid()) = user_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, done boolean not null default false, date date not null default current_date, detail text,
  created_at timestamptz not null default now());
alter table public.tasks enable row level security;
create policy "tasks_select_own" on public.tasks for select to authenticated using ((select auth.uid()) = user_id);
create policy "tasks_insert_own" on public.tasks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tasks_update_own" on public.tasks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tasks_delete_own" on public.tasks for delete to authenticated using ((select auth.uid()) = user_id);
create index tasks_user_idx on public.tasks (user_id, date);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now());
alter table public.habits enable row level security;
create policy "habits_select_own" on public.habits for select to authenticated using ((select auth.uid()) = user_id);
create policy "habits_insert_own" on public.habits for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "habits_update_own" on public.habits for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "habits_delete_own" on public.habits for delete to authenticated using ((select auth.uid()) = user_id);
create index habits_user_idx on public.habits (user_id);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, detail text, date date not null default current_date,
  created_at timestamptz not null default now());
alter table public.workouts enable row level security;
create policy "workouts_select_own" on public.workouts for select to authenticated using ((select auth.uid()) = user_id);
create policy "workouts_insert_own" on public.workouts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "workouts_update_own" on public.workouts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "workouts_delete_own" on public.workouts for delete to authenticated using ((select auth.uid()) = user_id);
create index workouts_user_idx on public.workouts (user_id, date);

create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  value text not null, date date not null default current_date,
  created_at timestamptz not null default now());
alter table public.weight_entries enable row level security;
create policy "weight_entries_select_own" on public.weight_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "weight_entries_insert_own" on public.weight_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "weight_entries_update_own" on public.weight_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "weight_entries_delete_own" on public.weight_entries for delete to authenticated using ((select auth.uid()) = user_id);
create index weight_entries_user_idx on public.weight_entries (user_id, date);

create table public.prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, date date not null default current_date,
  created_at timestamptz not null default now());
alter table public.prayers enable row level security;
create policy "prayers_select_own" on public.prayers for select to authenticated using ((select auth.uid()) = user_id);
create policy "prayers_insert_own" on public.prayers for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "prayers_update_own" on public.prayers for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "prayers_delete_own" on public.prayers for delete to authenticated using ((select auth.uid()) = user_id);
create index prayers_user_idx on public.prayers (user_id, date);

create table public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, detail text, date date not null default current_date,
  created_at timestamptz not null default now());
alter table public.readings enable row level security;
create policy "readings_select_own" on public.readings for select to authenticated using ((select auth.uid()) = user_id);
create policy "readings_insert_own" on public.readings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "readings_update_own" on public.readings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "readings_delete_own" on public.readings for delete to authenticated using ((select auth.uid()) = user_id);
create index readings_user_idx on public.readings (user_id, date);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, detail text, date date not null default current_date,
  created_at timestamptz not null default now());
alter table public.skills enable row level security;
create policy "skills_select_own" on public.skills for select to authenticated using ((select auth.uid()) = user_id);
create policy "skills_insert_own" on public.skills for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "skills_update_own" on public.skills for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "skills_delete_own" on public.skills for delete to authenticated using ((select auth.uid()) = user_id);
create index skills_user_idx on public.skills (user_id, date);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, category text not null check (category in ('Fitness','Finance','Faith','Career','Habits','Personal')), detail text, date date not null default current_date,
  created_at timestamptz not null default now());
alter table public.goals enable row level security;
create policy "goals_select_own" on public.goals for select to authenticated using ((select auth.uid()) = user_id);
create policy "goals_insert_own" on public.goals for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "goals_update_own" on public.goals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "goals_delete_own" on public.goals for delete to authenticated using ((select auth.uid()) = user_id);
create index goals_user_idx on public.goals (user_id, date);

create table public.budget_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, amount numeric not null default 0, date date not null default current_date,
  created_at timestamptz not null default now());
alter table public.budget_entries enable row level security;
create policy "budget_entries_select_own" on public.budget_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "budget_entries_insert_own" on public.budget_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "budget_entries_update_own" on public.budget_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "budget_entries_delete_own" on public.budget_entries for delete to authenticated using ((select auth.uid()) = user_id);
create index budget_entries_user_idx on public.budget_entries (user_id, date);

create table public.stocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  ticker text not null, shares numeric not null default 0, cost numeric not null default 0, price numeric not null default 0, date date not null default current_date,
  created_at timestamptz not null default now());
alter table public.stocks enable row level security;
create policy "stocks_select_own" on public.stocks for select to authenticated using ((select auth.uid()) = user_id);
create policy "stocks_insert_own" on public.stocks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "stocks_update_own" on public.stocks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "stocks_delete_own" on public.stocks for delete to authenticated using ((select auth.uid()) = user_id);
create index stocks_user_idx on public.stocks (user_id, date);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null, date date not null default current_date,
  created_at timestamptz not null default now());
alter table public.journal_entries enable row level security;
create policy "journal_entries_select_own" on public.journal_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "journal_entries_insert_own" on public.journal_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "journal_entries_update_own" on public.journal_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "journal_entries_delete_own" on public.journal_entries for delete to authenticated using ((select auth.uid()) = user_id);
create index journal_entries_user_idx on public.journal_entries (user_id, date);

create table public.quick_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, url text not null, position int not null default 0,
  created_at timestamptz not null default now());
alter table public.quick_links enable row level security;
create policy "quick_links_select_own" on public.quick_links for select to authenticated using ((select auth.uid()) = user_id);
create policy "quick_links_insert_own" on public.quick_links for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "quick_links_update_own" on public.quick_links for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "quick_links_delete_own" on public.quick_links for delete to authenticated using ((select auth.uid()) = user_id);
create index quick_links_user_idx on public.quick_links (user_id);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade, date date not null, done boolean not null default true, unique (habit_id, date),
  created_at timestamptz not null default now());
alter table public.habit_logs enable row level security;
create policy "habit_logs_select_own" on public.habit_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy "habit_logs_insert_own" on public.habit_logs for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.uid())));
create policy "habit_logs_update_own" on public.habit_logs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = (select auth.uid())));
create policy "habit_logs_delete_own" on public.habit_logs for delete to authenticated using ((select auth.uid()) = user_id);
create index habit_logs_user_idx on public.habit_logs (user_id, date);
create index habit_logs_habit_idx on public.habit_logs (habit_id);

create or replace function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id) values (new.id);
  insert into public.habits (user_id, name) values
    (new.id, 'Bible reading'), (new.id, 'Workout or active recovery'),
    (new.id, 'Deep work / study'), (new.id, 'Morning routine');
  insert into public.quick_links (user_id, name, url, position) values
    (new.id, 'ChatGPT', 'https://chatgpt.com', 0), (new.id, 'Google Calendar', 'https://calendar.google.com', 1),
    (new.id, 'GitHub', 'https://github.com', 2), (new.id, 'Supabase', 'https://supabase.com/dashboard', 3);
  return new;
end; $$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();
