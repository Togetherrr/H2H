# GitHub Actions Setup

This repo uses GitHub Actions as the scheduler for realtime polling and wins sync.
That is the right fit for Vercel Hobby, because the app itself can stay on Vercel while the background jobs run from GitHub.

## What should run

- `Realtime Poll` every 5 minutes
- `Wins Sync` once daily

## Required repository settings

Open your GitHub repository, then go to:

- `Settings`
- `Secrets and variables`
- `Actions`

Create these **repository variables**:

- `H2H_APP_URL`
  - Example: `https://your-app.vercel.app`
  - Use the deployed Vercel URL, not localhost

Create these **repository secrets**:

- `H2H_CRON_SECRET`
- `H2H_WINS_SYNC_TOKEN`

## What the workflows expect

- `/.github/workflows/realtime-poll.yml`
  - Calls `POST /api/realtime/poll` on your deployed app
  - Sends `x-cron-secret: $H2H_CRON_SECRET`

- `/.github/workflows/wins-sync.yml`
  - Calls `POST /api/wins/sync` on your deployed app
  - Sends `Authorization: Bearer $H2H_WINS_SYNC_TOKEN`

## Recommended first check

After pushing the repo changes:

1. Open `Actions`
2. Select `Realtime Poll`
3. Click `Run workflow`
4. Confirm it finishes with `200` or a successful JSON response
5. Do the same for `Wins Sync`

## Common failure points

- `Missing repository variable H2H_APP_URL`
  - The repo variable is not set, or it still points to localhost

- `Missing repository secret H2H_CRON_SECRET`
  - The secret is missing or has a typo

- `401 unauthorized`
  - The deployed app and the GitHub secret do not match

- `404` or network timeout
  - The Vercel deployment URL is wrong, or the deploy is not public/reachable

## Notes

- Keep `H2H_APP_URL` as the live production URL
- If you redeploy to a new Vercel domain, update the repository variable
- The workflows are safe to rerun manually
