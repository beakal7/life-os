# Life OS — personal dashboard

A personal command center (today, fitness, finance & stocks, faith, career, habits, goals) built with **Next.js 15 (static export)**, **Supabase** (Auth + Postgres with Row Level Security) and hosted on **Cloudflare Pages**.

## Repo layout

```
web/                     Next.js app (the only app)
  functions/api/ai.ts    Cloudflare Pages Function: authenticated Gemini proxy
  src/app/               layout + page (client-side auth gate)
  src/components/        AppShell, tabs, widgets, auth/AuthGate
  src/hooks/useLifeOS.ts state + optimistic updates
  src/lib/db.ts          Supabase data layer (14 tables)
  src/lib/supabase/      browser Supabase client
  src/lib/storage.ts     defaults, backup export/parse, helpers
supabase/migrations/     database schema, RLS policies, new-user trigger
legacy/                  original single-file index.html version (v0.2)
```

## Local development

```bash
cd web
cp .env.local.example .env.local   # fill in URL + publishable key
npm install
npm run dev                        # http://localhost:3000
```

Scripts: `npm run lint`, `npm run type-check`, `npm run build` (writes the static site to `web/out`).

## Supabase

1. Create a project (free tier is fine) and apply `supabase/migrations/*.sql`
   (`supabase link --project-ref <ref> && supabase db push`, or paste into the SQL editor).
2. Tables: `profiles`, `tasks`, `habits`, `habit_logs`, `workouts`, `weight_entries`, `prayers`, `readings`, `skills`, `goals`, `budget_entries`, `stocks`, `journal_entries`, `quick_links`.
   Every row has `user_id default auth.uid()`; RLS restricts select/insert/update/delete to the owner.
   A trigger on `auth.users` creates the profile, default habits and quick links for new users.
3. Auth → URL Configuration: set **Site URL** to your production URL and add redirect URLs
   (`http://localhost:3000/**`, `https://<project>.pages.dev/**`, your custom domain).
4. After creating your own account, disable public sign-ups (Auth → Sign In / Providers) for single-user use.

## Deploy to Cloudflare Pages

Workers & Pages → Create → Pages → Connect to Git → `beakal7/life-os`:

| Setting | Value |
|---|---|
| Framework preset | None (or Next.js (Static HTML Export)) |
| Root directory | `web` |
| Build command | `npm run build` |
| Build output directory | `out` |
| Env var `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| Env var `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your **publishable** key (`sb_publishable_…`) |
| Env var `NODE_VERSION` | `24` |

`NEXT_PUBLIC_*` values are inlined at build time, so redeploy after changing them.
Never put the service role key in this app.

## AI assistant

- **AI Coach tab:** chat with context from your tasks, goals, habits and cyber progress, a **Plan my day** button (using work hours and saved shifts, commute, and recovery constraints), and **task breakdown** into subtasks you can add to your inbox.
- Powered by the **Google Gemini API free tier** (`gemini-2.5-flash` by default) through `web/functions/api/ai.ts`. The function checks your Supabase access token, then calls Gemini with the server-side secret, so the key never reaches the browser.
- Setup: create a free key at https://aistudio.google.com/apikey, then in Cloudflare Pages → life-os → Settings → Variables and Secrets add **`GEMINI_API_KEY`** as a *Secret* (Production and Preview). Optional: `GEMINI_MODEL`. Redeploy. Until the key is set, the tab shows "AI not configured yet".
- **Open in ChatGPT / Open in Claude:** builds the same context-rich prompt and opens `chatgpt.com/?q=…` or `claude.ai/new?q=…` (uses your existing Plus/Pro web subscriptions; the prompt is also copied to the clipboard as a fallback).
- **Chat history** is optional (checkbox), stored in the `ai_messages` table with RLS.
- Free-tier note: Google may use free-tier prompts to improve its products, so avoid pasting sensitive work data.

For the deployment checklist and migration order, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Motivational home

The home page is a daily checklist: prayer, a 100-push-up counter, manual steps, gym or recovery, and checkable events from a connected primary Google Calendar. Counts and checks are private, saved per local date in `daily_checkins`, and reset for each new day while history remains stored. Calendar checks do not modify Google events. Finance navigation is deferred. The existing workout plan and church study tracker remain under a collapsed section below the checklist. See [Google Calendar setup](DEPLOYMENT.md#motivational-home-and-google-calendar) to enable read-only event access.

## Cyber tab

Skills roadmap (networking, Linux, Python/Bash, cloud security AWS/Azure, SIEM/detection, pentesting, certs Security+ → CySA+/AZ-500 → OSCP), a lab/study log (TryHackMe, HackTheBox, courses…), study streak, and a weekly hours target. Tables: `cyber_skills`, `cyber_logs`; settings live on `profiles`.

## Data & privacy

- Login: email + password or magic link (Supabase Auth). The page is a static site; the auth gate runs in the browser and **Row Level Security** is what protects your data.
- Migrating from the old browser-only version: sign in, then click **Import local data** (reads `localStorage["lifeos-v1"]`) or **Import** a JSON backup. **Backup** downloads a JSON export at any time.
- Stock prices are entered manually.
