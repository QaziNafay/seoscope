# SEOScope

> Free, server-side SEO analyzer. Paste a URL, get a score, full technical audit, and actionable fixes.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Live](https://img.shields.io/badge/demo-vercel-black?logo=vercel)](https://seoscope.vercel.app)

---

## Features

- **SEO Score** — 0–100 with weighted deductions (meta, headings, images, links, HTTPS, noindex, word count)
- **Meta Tags** — title, description, keywords, canonical, robots, viewport, charset, favicon
- **Technical SEO** (10 expandable checks) — HTTPS, page size, compression, structured data, crawlability, doctype, language, hreflang, HTTP protocol, sitemap
- **Headings** — H1/H2/H3 structure audit with duplicate/missing detection
- **Images** — alt attribute coverage, decorative image support (`alt=""` treated as valid)
- **Links** — internal vs external, nofollow/ugc/sponsored detection
- **Keywords** — top 30 word frequency with density % and bar chart (stop words excluded)
- **Recommendations** — prioritized list with specific, actionable guidance

## Quick Start

```bash
git clone https://github.com/QaziNafay/seoscope.git
cd seoscope
npm install
npm run dev        # → http://localhost:3000
```

## Architecture

```
app/
├── api/analyze/route.ts      # POST endpoint (rate-limited, validated)
├── components/                # React components (8 panels)
├── globals.css                # Tailwind entry
├── layout.tsx                 # Root layout + metadata
└── page.tsx                   # Main SPA (input → results)

lib/
├── analyze.ts                 # Orchestrator: fetches URL, runs all analyzers, computes score
├── rate-limit.ts              # In-memory sliding-window rate limiter (10 req/min)
├── types.ts                   # All TypeScript interfaces
└── analyzers/
    ├── meta.ts                # Title, description, canonical, robots, viewport, charset, favicon
    ├── headings.ts            # H1, H2, H3 extraction + validation
    ├── images.ts              # img[src] + alt audit
    ├── links.ts               # a[href] audit (internal, external, rel)
    ├── keywords.ts            # Word frequency, stop-list, density
    ├── social.ts              # Open Graph + Twitter Card (property + name fallback)
    └── technical.ts           # 10-point technical SEO scan (HTTP + DOM + extra HEAD req)
```

### How analysis works

1. Client sends `POST /api/analyze { url }`
2. API route validates, normalizes, rate-limits, then calls `analyzePage()`
3. `analyzePage()` fetches the URL (15s timeout, follows redirects)
4. Validates HTTP status (200) and Content-Type (text/html)
5. Parses HTML with cheerio, passes `$` to each analyzer module
6. Computes score (starts at 100, subtracts for each issue, clamped to 0)
7. Returns the full `AnalysisResult` JSON

### Adding a new analyzer

1. Create `lib/analyzers/<name>.ts` — export a function that takes `$: cheerio.CheerioAPI` (and optional params)
2. Import and call it in `lib/analyze.ts`
3. Add a component in `app/components/` to render the result
4. Wire it into `app/page.tsx`

## API

### `POST /api/analyze`

**Request:**
```json
{ "url": "https://example.com" }
```

**Response** — `AnalysisResult`:

| Field | Type | Description |
|-------|------|-------------|
| `url` | `string` | Final URL after redirects |
| `score` | `number` | 0–100 |
| `meta` | `MetaResult` | All meta tags + lengths |
| `headings` | `HeadingResult` | H1/H2/H3 arrays + issues |
| `images` | `ImageResult[]` | Every `<img>` with alt status |
| `links` | `LinkResult[]` | All `<a href>` with type + followability |
| `technical` | `TechnicalSeoResult` | 10 items with status/value/detail |
| `keywords` | `KeywordResult[]` | Top 30 words with count + density |
| `wordCount` | `number` | Meaningful words (after stop/filter) |
| `recommendations` | `string[]` | Prioritized action items |
| `loadTime` | `number` | Network fetch time (ms) |

**Errors:**

| Status | When |
|--------|------|
| `400` | Missing/invalid URL, or non-HTML response |
| `429` | Rate limit exceeded (10 req/min per IP) |
| `500` | Fetch failure, timeout, or server error |

## Deployment

Zero-config on Vercel:

```bash
git push origin master
```

The `vercel.json` file applies security headers (CSP, X-Frame-Options, Permissions-Policy). No environment variables or secrets needed.

## Local Development

```bash
npm run dev      # hot-reload dev server
npm run build    # type-check + compile
npm run lint     # ESLint
```

The API runs at `http://localhost:3000/api/analyze` and works identically to production.

## Security

- **No persistence** — analysis is ephemeral, no database
- **Rate limited** — 10 requests per minute per IP (in-memory, auto-cleanup)
- **CSP headers** — strict Content-Security-Policy on all routes
- **Input validation** — URL length cap (2048), protocol required, URL object parse
- **Response validation** — rejects non-200 and non-HTML responses
- **Timeout** — 15-second abort on all outbound fetches
- **User-Agent** — outgoing requests identify as `SEOScope/1.0`

## Limitations

- **Server-side only** — cannot analyze JavaScript-rendered content (SPA, React, Vue)
- **Single-page snapshot** — no multi-page crawling or sitemap generation
- **No Core Web Vitals** — these require real browser metrics (LCP, CLS, INP)
- **No auth** — designed as a free public tool
- **No caching** — every request fetches the target page fresh

## License

MIT — see [LICENSE](./LICENSE).

---

<p align="center">
  <a href="https://seoscope.vercel.app">seoscope.vercel.app</a>
  ·
  <a href="./CONTRIBUTING.md">Contributing</a>
  ·
  <a href="./SECURITY.md">Security</a>
</p>
