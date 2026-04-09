# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### NaukriQuest AI (`artifacts/naukriquest-ai`)
- **Type**: react-vite
- **Preview path**: `/`
- **Description**: India's AI-powered tech job search platform — dark/light themed, mobile-responsive
- **Features**:
  - AI job search (Gemini 2.5 Flash) with real apply links + Show More pagination
  - Voice search (Web Speech API, en-IN)
  - Dark / Light mode toggle (persisted in localStorage) — CSS vars: `--nq-bg`, `--nq-text`, `--nq-surface`, etc.
  - Resume Match: paste text or upload file → AI extracts profile + 12-point ATS checkpoint scan + keyword scanner + AI resume rewriter + improvement tips + 5 matched jobs
  - AI Courses finder by interest (free & paid, Lucide icons, real platform links)
  - Floating AI chatbot (SSE streaming, voice I/O, quick-prompt chips)
  - Custom neon cursor, terminal log animation with `keepAlive` prop
  - Salary benchmark widget (2025 India data)
  - Hamburger mobile nav with all pages
- **Key files**:
  - `src/lib/theme.tsx` — ThemeContext, ThemeProvider, useTheme()
  - `src/lib/cloudflare-worker.ts` — job/course search helpers
  - `src/pages/HomePage.tsx` — main search UI (theme-aware)
  - `src/pages/CoursesPage.tsx` — interest-based course finder
  - `src/pages/ResumeMatchPage.tsx` — full resume analysis with ATS score/tips
  - `src/components/AIChatbot.tsx` — floating chatbot
  - `src/components/JobCard.tsx` — job result card
  - `src/components/TerminalLog.tsx` — terminal animation; `keepAlive` prop prevents reset on unmount
  - `src/components/CustomCursor.tsx` — neon cursor
- **CSS theme classes**: `.nq-page-bg`, `.nq-glass`, `.grid-bg` all use CSS vars for light/dark

### API Server (`artifacts/api-server`)
- `src/routes/jobs.ts` — GET /api/jobs/search (Gemini AI, with fallback)
- `src/routes/courses.ts` — GET /api/courses/search (Gemini AI, with fallback)
- `src/routes/resume.ts` — POST /api/resume/analyze → returns name, experience, ATS score, ats_breakdown, 12 checkpoints, missing_keywords, improvement_tips, section_analysis, target_job_analysis, matchedJobs; POST /api/resume/rewrite → AI rewrites resume for target job role
- `src/routes/chat.ts` — POST /api/chat/message → SSE streaming (Llama 3.3 70B via OpenRouter)
- Uses `@workspace/integrations-gemini-ai` for Gemini 2.5 Flash
- `build.mjs` — `@google/genai` is NOT in externals (must be bundled)
