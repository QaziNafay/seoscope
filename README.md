# SEOScope

> Free, server-side SEO analyzer. Paste a URL, get a score, full technical audit, Core Web Vitals, framework detection, sitemap crawl, and actionable fixes.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Live](https://img.shields.io/badge/demo-vercel-black?logo=vercel)](https://seoscope.vercel.app)

---

## Features

- **SEO Score** — 0–100 with weighted deductions (meta, headings, images, links, HTTPS, noindex, word count, CWV)
- **Meta Tags** — title, description, keywords, canonical, robots, viewport, charset, favicon
- **Technical SEO** (10 expandable checks) — HTTPS, page size, compression, structured data, crawlability, doctype, language, hreflang, HTTP protocol, sitemap
- **Core Web Vitals** — LCP, CLS, INP + PageSpeed score via Google's free API
- **Framework Detection** — auto-detects React, Vue, Angular, Svelte, Next.js, Nuxt, Gatsby, Astro, jQuery — warns when client-side rendering may limit analysis
- **Sitemap Crawl** — optional: provide a sitemap URL to scan up to 5 pages for titles, H1s, word counts, canonical, viewport
- **Headings** — H1/H2/H3 structure audit with duplicate/missing detection
- **Images** — alt attribute coverage, decorative image support (`alt=""` treated as valid)
- **Links** — internal vs external, nofollow/ugc/sponsored detection
- **Keywords** — top 30 word frequency with density % and bar chart (stop words excluded)
- **Recommendations** — prioritized list with specific, actionable guidance
- **Caching** — in-memory LRU cache (50 entries, 60s TTL) avoids redundant fetches

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
├── components/                # React components (12 panels + banners)
├── globals.css                # Tailwind entry
├── layout.tsx                 # Root layout + metadata
└── page.tsx                   # Main SPA (input → results)

lib/
├── analyze.ts                 # Orchestrator: fetches, caches, runs analyzers, scores
├── cache.ts                   # In-memory LRU cache (60s TTL, max 50)
├── rate-limit.ts              # Sliding-window rate limiter (10 req/min, periodic cleanup)
├── types.ts                   # All TypeScript interfaces
└── analyzers/
    ├── meta.ts                # Title, description, canonical, robots, viewport, charset, favicon
    ├── headings.ts            # H1, H2, H3 extraction + validation
    ├── images.ts              # img[src] + alt audit (data: URIs skipped, empty alt valid)
    ├── links.ts               # a[href] audit (internal/external, rel=nofollow/ugc/sponsored)
    ├── keywords.ts            # Word frequency, stop-list, density (filters script/style)
    ├── technical.ts           # 10-point technical SEO scan (HTTP + DOM + sitemap HEAD req)
    ├── framework.ts           # JS framework detection (9 frameworks, DOM + script patterns)
    ├── crawl.ts               # Sitemap XML parser, parallel page crawl (up to 5)
    └── pagespeed.ts           # Google PageSpeed Insights v5 API wrapper (CWV data)
```

### How analysis works

1. Client sends `POST /api/analyze { url, sitemap? }`
2. API route validates both URLs, rate-limits by IP, then calls `analyzePage()`
3. `analyzePage()` checks the LRU cache — if found, skips the network fetch
4. Fetches the URL (15s timeout, follows redirects, validates 200 + text/html)
5. Parses HTML with cheerio, passes the `$` wrapper to each synchronous analyzer
6. Runs `detectFramework()` to classify the stack and warn if client-rendered
7. Starts `analyzeTechnical()` (some HEAD requests), `analyzePageSpeed()` (CWV API), and optionally `crawlSitemap()` in parallel via `Promise.all`
8. Computes score (starts at 100, subtracts for each issue, clamped to 0)
9. Returns the full `AnalysisResult` JSON

### Adding a new analyzer

1. Create `lib/analyzers/<name>.ts` — export a function
2. Import and call it in `lib/analyze.ts`
3. Create `app/components/<Name>Panel.tsx` for rendering
4. Wire it into `app/page.tsx`

## API

### `POST /api/analyze`

**Request:**
```json
{ "url": "https://example.com", "sitemap": "https://example.com/sitemap.xml" }
```
`sitemap` is optional.

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
| `wordCount` | `number` | Meaningful words (after stop-word filter) |
| `loadTime` | `number` | Network fetch time (ms) |
| `recommendations` | `string[]` | Prioritized action items |
| `coreWebVitals` | `CoreWebVitals \| null` | LCP, CLS, INP, PageSpeed score (null on failure) |
| `framework` | `FrameworkInfo \| null` | Detected frameworks + client-render warning |
| `crawledPages` | `CrawledPage[] \| null` | Sitemap crawl results (null if no sitemap given) |

**Errors:**

| Status | When |
|--------|------|
| `400` | Missing/invalid URL, invalid sitemap URL, or non-HTML response |
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
npm run dev      # hot-reload dev server → localhost:3000
npm run build    # type-check + compile
npm run lint     # ESLint
```

The API runs at `http://localhost:3000/api/analyze` and works identically to production.

## Security

- **No persistence** — analysis is ephemeral, no database
- **Rate limited** — 10 requests per minute per IP (in-memory, auto-cleanup every 60s)
- **CSP headers** — strict Content-Security-Policy on all routes (`next.config.ts` + `vercel.json`)
- **Input validation** — URL length cap (2048), protocol required, URL object parse for both URL and sitemap
- **Response validation** — rejects non-200 and non-HTML responses
- **Timeout** — 15-second abort on all outbound fetches
- **User-Agent** — outgoing requests identify as `SEOScope/1.0`
- **Cache** — ephemeral in-memory; cleared on server restart; never written to disk

## Known Limitations

- **Client-rendered content** — SPA pages (React, Vue, Angular) may have minimal server HTML. Framework banner warns when detected.
- **PageSpeed accuracy** — uses Google's lab data (not real-user metrics from CrUX), which varies by location and connection.
- **Sitemap crawl** — limited to 5 pages to stay within Vercel's free-tier timeout (10s serverless limit).
- **Cache** — per-instance (not shared) — each Vercel function invocation has its own memory space.

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
