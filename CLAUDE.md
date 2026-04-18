# Postone — 小紅書 AI 創作工具

## What This Is

Postone is an internal AI-powered 小紅書 content generator for Jones Ng (Chiwa DCM Group).
It generates 小紅書-native posts in Jones' voice using the Claude API.

Phase 1: AI copy generation (this repo).
Phase 2: Publish to 小紅書 via Playwright (no official API available).
Phase 3: Chinese platform matrix (Crebee.cn integration).
Phase 4: Western platform matrix (SocialEcho integration).

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

Run `supabase/migrations/001_posts.sql` in your Supabase SQL editor.
Row-level security is enabled — users only see their own posts.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/persona.ts` | Jones' AI voice prompt — edit to tune output |
| `src/app/api/generate/route.ts` | Claude API call with prompt caching |
| `src/middleware.ts` | Auth redirect guard |
| `src/components/GenerateForm.tsx` | Brief input + tone selector |
| `src/components/OutputCard.tsx` | Generated post display + copy button |
| `src/components/DraftList.tsx` | Drafts history with status toggle |

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
