# Finish the existing Cloudflare deployment

The application is a static Next.js export with Cloudflare Pages Functions and a Supabase backend. Apply only migrations that are missing from the target database, and verify the deployed branch and production URL before making changes.

1. Review and merge this branch into `main`. The included GitHub workflow checks lint, types, AI endpoint behavior, and the static build with Node 24.
2. Apply unapplied Supabase migrations in timestamp order. For an existing database, check the migration history first; do not re-run the initial schema over existing tables. The cyber/AI migration creates three owner-protected tables; the final migration adds private planning constraints to profiles.
3. In the existing Cloudflare Pages project `life-os`, connect `beakal7/life-os`, production branch `main`, root `web`, build `npm run build`, output `out`, Node version `24`.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the existing project's public URL and publishable key. These must be available at both build time and Pages Function runtime.
5. Add `GEMINI_API_KEY` as an encrypted Cloudflare secret, never as a `NEXT_PUBLIC_` variable. `GEMINI_MODEL` is optional. Free API access and quotas depend on Google's current account/region rules. ChatGPT Plus and Claude subscriptions work through the handoff buttons without an API key.
6. Deploy with the Pages Functions directory included (`web/functions`). A drag-and-drop upload of `out` alone does not deploy the AI endpoint. For a CLI deployment, run `npx wrangler@4 pages deploy out --project-name life-os` **from `web`**, after building and signing in to Cloudflare.
7. In Supabase Auth, use `https://life-os-3dp.pages.dev` as Site URL and allow its redirect URL. Sign in with your existing account. Keep public signups disabled if this is a personal dashboard.

## Verify after deployment

- Sign in, create a task, reload, and verify it remains. Sign out and verify the dashboard hides.
- Open Cyber, update a skill and record a lab, then reload.
- Open AI Coach, save your work shifts/commute/sleep constraints, reload, then plan the day. Verify the schedule respects your commitments before using it.
- Test task breakdown and adding subtasks to the inbox.
- Open ChatGPT and Claude. The full prompt is copied; paste it if the app does not prefill. Avoid sharing confidential employer information.
- Without a Gemini key, the coach should show a configuration message and the handoff buttons should remain usable.
- The local automated AI endpoint tests mock Supabase and Gemini. They do not prove production credentials, database policies, or provider billing configuration.

## Local validation

Use Node 24, `cd web`, `npm ci`, `npm run lint`, `npm run type-check`, `npm test`, `npm run build`.
`npm run dev` serves the dashboard but not the Pages Function. For the full local stack, build and run `npx wrangler@4 pages dev out` from `web`, with secrets in a gitignored `.dev.vars` file.

## Motivational home and Google Calendar

The `motivational_home` migration adds the `home_settings` JSON field to profiles, using the existing owner-only policies. It stores the weekly workout plan, gym target, and six-day church study progress/reflections. Workout completions use the existing workouts table. Recovery sessions are labeled separately and do not count toward gym goals. The gym streak counts consecutive weeks meeting the selected target, including the current week once its goal is met. Religious course details are private profile data, not source defaults.

For Google Calendar:

1. Enable the Google Calendar API in a Google Cloud project.
2. Configure an OAuth consent screen and add your Google account as a test user if the app is in testing.
3. Create an OAuth client of type Web application. Add `https://life-os-3dp.pages.dev` (and the exact custom/preview origins you use) to Authorized JavaScript origins. Add `http://localhost:3000` for local testing.
4. Set build variable `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to that OAuth client ID and rebuild/redeploy. This is a public identifier, not a client secret. No client secret is needed for this browser token flow.
5. In the home calendar, click Connect Google Calendar and approve read-only event access. Events from your primary Google calendar appear as blue dots and in the selected date's agenda.

The Google access token stays in memory, is never saved to Supabase/localStorage, and is cleared when the home widget unmounts or the user disconnects. Reconnect after reloading or after token expiry. Refresh explicitly after changing events in Google. Paginated, recurring, all-day, and multiday events are supported. Secondary calendars and background server synchronization are not included. The chat's Google Calendar connection cannot be reused as the website's OAuth credentials.

The application does not create or edit Google events. Without Google configuration, gym/habit calendar tracking remains available and the page explains the missing setup.
