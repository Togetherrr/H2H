# h2h

Source base với:

- Next.js (App Router)
- Bun
- Tailwind CSS
- Zustand
- TypeScript
- shadcn/ui

## Quick start

1. Cài dependency:

   `bun install`

2. Chạy dev server:

   `bun run dev`

3. Lint source:

   `bun run lint`

4. Build production:

   `bun run build`

5. Start production:

   `bun run start`

## Cấu trúc chính

- `src/app/layout.tsx`: Root layout của App Router.
- `src/app/page.tsx`: Server component của trang chủ.
- `src/components/counter-demo.tsx`: Client component demo Zustand.
- `src/components/ui/button.tsx`: Button theo style shadcn/ui.
- `src/store/index.ts`: Zustand store mẫu.
- `src/lib/utils.ts`: Helper `cn` cho Tailwind class merging.
- `tests/playwright/e2e`: Nơi đặt test e2e Playwright sau này.

## Ghi chú

- Alias `@/*` trong `tsconfig.json` trỏ tới `src/*`.
- Cấu hình shadcn nằm ở `components.json`.
- ESLint đã được cấu hình để chạy không interactive.

## Wiki Sync (Wikidata + ISR)

- App hỗ trợ tự sync release từ Wikidata qua `src/lib/release-catalog.ts`.
- Set biến môi trường `WIKIDATA_ARTIST_QID` để bật nguồn wiki (ví dụ: `Qxxxxxx`).
- Nếu không set QID hoặc API lỗi, app tự fallback sang catalog local để không vỡ UI.
- Revalidate mặc định mỗi `3600s` (1 giờ) cho home và album detail.
