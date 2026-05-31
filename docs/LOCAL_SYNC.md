# Local scheduling (no Vercel needed)

This repo has background-sync endpoints meant to be called by a scheduler (Windows Task Scheduler, Linux cron, or CI).
On Vercel Hobby, keep scheduling outside Vercel Cron and use GitHub Actions instead.

## Environment variables

- `APP_URL` (optional): base URL for local scripts (default `http://localhost:3000`)
- `H2H_WINS_SYNC_TOKEN`: token for `POST /api/wins/sync`
- `H2H_TIMELINE_SYNC_TOKEN`: token for `POST /api/timeline/sync`

The API routes also require Supabase service access:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Run once (manual)

- Sync wins: `bun run sync:wins:local`
- Sync timeline: `bun run sync:timeline:local`

## Windows Task Scheduler (example)

Create a Basic Task that runs daily / hourly and uses:

- Program: `bun`
- Arguments: `run sync:wins:local`
- Start in: your repo folder

Do the same for `sync:timeline:local`.

Alternatively, call the endpoints directly with PowerShell `Invoke-WebRequest` and the Bearer token.

