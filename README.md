# Life OS v0.2 — personal dashboard

## Open locally
Double-click `index.html` in Chrome. No installation required.

## Publish to Vercel (free Hobby plan for personal use)
1. Sign into https://vercel.com/new and import a GitHub repository containing `index.html` and `manifest.webmanifest`; or install CLI with `npm i -g vercel`.
2. From this directory run `vercel login` and `vercel --prod`. For a static site, set Framework Preset to Other and Output Directory blank/default.
3. Open the given HTTPS URL on iPhone and Mac. In Safari, Share > Add to Home Screen.

## Important: Data and privacy
All data is saved to **browser localStorage**. Both devices can access the published web app, but their entries **do not sync yet**. Use Backup / Restore to manually transfer. Do not enter sensitive financial/account information; there is no login, encryption-at-rest under an account, automatic backup or cloud synchronization. Publishing a URL alone does not make the app private.

## Features
- Interactive month grid with daily habit markers
- Daily inspiration, editable vision, favorite links
- Habit checklist and current streak counts
- Daily/weekly top-three priorities
- 25-minute focus timer plus task inbox and reflections
- Fitness, finance & stocks (MANUAL prices), faith, career, habits, goals tabs
- Export/import JSON backup

## Next phase
Connect authenticated Supabase data with row-level security, migrate browser data, then enable cloud synchronization. Add live quote API and Kiro Crew automation separately.
