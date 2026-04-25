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

Landing page van public. User chi can dang nhap khi dung tinh nang can tai khoan, va `/admin` chi mo cho role `admin`.

Repo nay da duoc chuan hoa theo Bun:
- cai package: `bun add <package>`
- chay dev: `bun run dev`
- lint: `bun run lint`
- typecheck: `bun run typecheck`
