# Postone — 小紅書 AI 創作工具

## What This Is

Postone is an internal AI-powered 小紅書 content generator for Jones Ng (Chiwa DCM Group).
It generates 小紅書-native posts in Jones' voice using the Claude API.

Phase 1: AI copy generation ✅ 已完成
Phase 1b: 以圖生文（圖片上傳 → Qwen VL 視覺分析 → 小紅書文案）✅ 已完成
Phase 1c: 素材庫 + 內容日曆 + 熱門話題 + 數據分析 ✅ 已完成
Phase 2: 發佈到小紅書（Playwright 自動化，無官方 API）
Phase 3: 中文平台矩陣（Crebee.cn 整合）
Phase 4: 西方平台矩陣（SocialEcho 整合）

## Jones' Brand Voice

Jones Ng is HK's No.1 小紅書 authority ("小紅書第一人"), with 18+ years in China internet marketing.
His voice: direct, Cantonese-inflected written Chinese, case-first storytelling, always practical.
Full persona lives in `src/lib/persona.ts` — edit there to tune AI output.

## Tech Stack

- Next.js 15 + TypeScript + Tailwind CSS
- Supabase (magic-link auth + PostgreSQL)
- Claude API (`claude-sonnet-4-6`) with prompt caching on system prompt
- Vercel (auto-deploy from GitHub `main`)

## Required .env.local

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## Database

Run migrations in order in your Supabase SQL editor:
1. `supabase/migrations/001_posts.sql` — creates `posts` table
2. `supabase/migrations/002_expand_schema.sql` — adds `platforms`, `scheduled_at`, `metrics` columns + `assets` and `trending_topics` tables

Row-level security is enabled — users only see their own rows.

### Supabase Storage
Create a **public** bucket named `assets` (Dashboard → Storage → New bucket, toggle Public).
This is used by 素材庫 (`/assets`) for product image uploads.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/persona.ts` | Jones' AI voice prompt — edit to tune output |
| `src/app/api/generate/route.ts` | Qwen API — 純文字用 qwen-plus，有圖用 qwen-vl-plus |
| `src/app/api/trending/route.ts` | 熱門話題 AI 推薦 — Qwen 生成 5 個選題 |
| `src/app/api/assets/route.ts` | 素材庫上傳 — Supabase Storage + assets table |
| `src/app/api/posts/route.ts` | Posts list + `[id]/route.ts` 支援 PATCH / DELETE |
| `src/proxy.ts` | Auth redirect guard (Next.js 16) |
| `src/components/Nav.tsx` | 全站頂部導航 |
| `src/components/GenerateForm.tsx` | Brief + 圖片 + 平台 + 排程 |
| `src/app/generate/page.tsx` | 生成頁 |
| `src/app/drafts/page.tsx` | 草稿庫 |
| `src/app/calendar/page.tsx` | 內容日曆（月曆視圖 + 排程 modal） |
| `src/app/trending/page.tsx` | 熱門話題推薦 |
| `src/app/assets/page.tsx` | 素材庫 |
| `src/app/analytics/page.tsx` | 數據分析（手動回填 views/likes/etc.） |

## Adding Features

Follow the existing pattern:
1. Add a new API route in `src/app/api/`
2. Add a new page in `src/app/`
3. Add components in `src/components/`
4. Run `npm run build` to verify no type errors before pushing

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build (run before pushing)
npm run lint     # lint check
```

## Deployment

Push to `main` → Vercel auto-deploys.
Set the four env vars in Vercel project settings → Environment Variables.

## No Official 小紅書 API

小紅書 has no public API. Publishing in Phase 2 will use Playwright browser automation.
Never attempt to reverse-engineer or scrape 小紅書 in ways that violate their ToS.
