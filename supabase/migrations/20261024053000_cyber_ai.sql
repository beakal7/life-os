-- Life OS: Cyber tab, AI assistant settings and optional chat history

-- Profile settings for planning and cyber targets
alter table public.profiles
  add column if not exists work_start text not null default '09:00',
  add column if not exists work_end text not null default '17:00',
  add column if not exists cyber_weekly_target_hours numeric not null default 8;

-- Roadmap progress: one row per roadmap item the user has touched
create table public.cyber_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key text not null,
  status text not null default 'todo' check (status in ('todo','learning','done')),
  notes text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, key)
);

-- Lab / study log (TryHackMe, HackTheBox, courses, reading...)
create table public.cyber_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  platform text not null default 'Other',
  title text not null,
  minutes int not null default 0 check (minutes >= 0 and minutes <= 1440),
  skill_key text,
  notes text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Optional AI chat history
create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.cyber_skills enable row level security;
alter table public.cyber_logs  enable row level security;
alter table public.ai_messages enable row level security;

create policy "cyber_skills_select_own" on public.cyber_skills for select to authenticated using ((select auth.uid()) = user_id);
create policy "cyber_skills_insert_own" on public.cyber_skills for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "cyber_skills_update_own" on public.cyber_skills for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "cyber_skills_delete_own" on public.cyber_skills for delete to authenticated using ((select auth.uid()) = user_id);

create policy "cyber_logs_select_own" on public.cyber_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy "cyber_logs_insert_own" on public.cyber_logs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "cyber_logs_update_own" on public.cyber_logs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "cyber_logs_delete_own" on public.cyber_logs for delete to authenticated using ((select auth.uid()) = user_id);

create policy "ai_messages_select_own" on public.ai_messages for select to authenticated using ((select auth.uid()) = user_id);
create policy "ai_messages_insert_own" on public.ai_messages for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ai_messages_update_own" on public.ai_messages for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "ai_messages_delete_own" on public.ai_messages for delete to authenticated using ((select auth.uid()) = user_id);

create index cyber_logs_user_idx on public.cyber_logs (user_id, date);
create index ai_messages_user_idx on public.ai_messages (user_id, created_at);
