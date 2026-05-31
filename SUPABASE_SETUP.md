# Supabase Setup

## 1. Tao project

Tao 1 project moi trong Supabase dashboard.

## 2. Them env vao Next.js

Copy `.env.example` thanh `.env.local` va dien:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Gia tri nay nam o:
- `Project Settings > API`

## 3. Chay SQL schema

Mo `SQL Editor` trong Supabase va chay file:

- [supabase/schema.sql](/E:/my-project/H2H/supabase/schema.sql)

Schema nay se tao:
- `profiles`
- `site_settings`
- `members`
- `releases`
- `tracks`
- `timeline_events`
- `social_links`

Neu ban muon hien thi Spotify/YouTube realtime theo rolling 24h (TOTAL / DAILY / DAILY CHANGE), chay them migration:
- `supabase/migrations/20260507_add_realtime_snapshots.sql`

Dong thoi no cung tao:
- trigger tao `profiles` tu dong khi user dang nhap lan dau
- enum role `user/admin`
- RLS policy cho public va admin

## 4. Bat Google login

Vao:
- `Authentication > Providers > Google`

Bat provider va cau hinh Google OAuth.

Redirect URL can them:

```txt
http://localhost:3000/auth/callback
```

Neu deploy production thi them domain production cua ban nua.

## 5. Tao admin dau tien

Dang nhap bang Google 1 lan de Supabase tao record trong `profiles`.

Sau do vao `Table Editor > profiles` va doi role tu:

```txt
user -> admin
```

## 6. Chay app

```bash
bun run dev
```

Route da co san:
- `/login`
- `/admin`
- `/auth/error`

## 7. Theo doi DB va API

Trong Supabase dashboard:
- `Table Editor`: xem va sua data
- `SQL Editor`: chay query SQL
- `Authentication`: xem user dang nhap
- `Project Settings > API`: lay URL, keys va xem API config

## Ghi chu

### Realtime snapshots (poll 5 phut)

- Set env/secret:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `H2H_CRON_SECRET`
  - `H2H_YOUTUBE_API_KEY`
  - `H2H_YOUTUBE_VIDEO_IDS`
  - `H2H_YOUTUBE_CHANNEL_ID` or `H2H_YOUTUBE_CHANNEL_HANDLE`
  - `H2H_SPOTIFY_ARTIST_ID`
  - `H2H_SPOTIFY_ARTIST_NAME`
  - `H2H_SPOTIFY_FOLLOWERS` (optional manual fallback)
- Set repository variable:
  - `H2H_APP_URL` = URL deploy chinh, vi du `https://your-app.vercel.app`
- Scheduler khuyen dung:
  - `.github/workflows/realtime-poll.yml`
  - `.github/workflows/wins-sync.yml`
- Workflow se goi:
  - `GET /api/realtime/poll` voi header `x-cron-secret: <H2H_CRON_SECRET>` moi 5 phut
- UI/API doc du lieu rolling 24h:
  - `GET /api/realtime/summary?type=spotify_track`
  - `GET /api/realtime/summary?type=youtube_video`
- `h2h_social_stats_snapshots` chua cache social stats: Spotify followers / monthly listeners va YouTube subscribers / video count
- Nguon Spotify hien tai la free public data tu Music Metrics Vault, KWORB la fallback cho monthly listeners neu can

Neu ban dung GitHub Actions, chi can:
1. Tao repository variable `H2H_APP_URL`
2. Tao repository secret `H2H_CRON_SECRET`
3. Tao repository secret `H2H_WINS_SYNC_TOKEN`
4. Bat workflow `Realtime Poll` va `Wins Sync`

Neu Vercel project cua ban con Cron job cu cho `/api/realtime/poll`, xoa no trong Vercel dashboard de tranh loi deploy tren Hobby.

Chi tiet day du hon o:
- [docs/GITHUB_ACTIONS_SETUP.md](/D:/H2H/H2H/docs/GITHUB_ACTIONS_SETUP.md)

### Kiem tra local khong can deploy

Neu ban chua deploy, van co the check ngay tren may local:

1. Chay dev server:
  - `bun run dev`
2. Dat `H2H_CRON_SECRET` trong `.env.local`.
3. Goi poll local:
  - `bun run realtime:poll:local`
4. Neu dev server khong o port 3000, set them `REALTIME_POLL_BASE_URL`, vi du:
  - `REALTIME_POLL_BASE_URL=http://localhost:3002 bun run realtime:poll:local`

Script nay se goi:
- `GET /api/realtime/poll?dryRun=1` voi header `x-cron-secret`
- in ra JSON response de ban biet snapshot co duoc upsert hay khong

Landing page van public. User chi can dang nhap khi dung tinh nang can tai khoan, va `/admin` chi mo cho role `admin`.

Repo nay da duoc chuan hoa theo Bun:
- cai package: `bun add <package>`
- chay dev: `bun run dev`
- lint: `bun run lint`
- typecheck: `bun run typecheck`
