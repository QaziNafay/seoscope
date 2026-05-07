# AGENTS.md — SEOScope

This file helps opencode understand the project.

## Commands

```bash
npm run dev    # start dev server
npm run build  # production build
npm start      # run production server
npm run lint   # run linter
```

## Structure

- `app/` — Next.js App Router pages & components
- `app/api/analyze/route.ts` — POST endpoint for analysis
- `lib/` — server-side logic (analyzers, types, rate-limit)
- `vercel.json` — deployment security headers

## Conventions

- TypeScript everywhere, no `any`
- Tailwind classes only (no CSS modules)
- New analyzers go in `lib/analyzers/`
- New components go in `app/components/`
- No database, no auth, no external APIs
