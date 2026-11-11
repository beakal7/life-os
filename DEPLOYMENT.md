# Finish the existing Cloudflare deployment

The completed source is based on `origin/ai-assistant`, not the older `main` branch. This checkout has not been pushed, merged, or deployed. Existing production data has not been modified.

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
