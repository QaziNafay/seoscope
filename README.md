# SEOScope — Free SEO Analyzer

Analyze any webpage for SEO issues. Get a score, meta tags breakdown, heading structure audit, link analysis, technical SEO checks, keyword density, and actionable recommendations.

Live demo: [seoscope.vercel.app](https://seoscope.vercel.app)

---

## Features

- **SEO Score** — 0–100 rating based on industry best practices
- **Meta Tags** — title, description, keywords, canonical, robots, viewport, charset, favicon
- **Technical SEO** — HTTPS, compression, structured data, crawlability, doctype, language, hreflang, sitemap, HTTP protocol, and page size — each with expandable explanations
- **Headings** — H1/H2/H3 structure with missing/multiple H1 warnings
- **Images** — alt attribute audit with missing-alt counts
- **Links** — internal vs external breakdown, nofollow detection
- **Keywords** — top 30 words by frequency with density % and bar chart
- **Recommendations** — prioritized list of actionable fixes
- **Mobile-friendly** — responsive UI, works on any device

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 19, Next.js 15 (App Router)  |
| Styling  | Tailwind CSS 4                      |
| Backend  | Next.js API Routes (serverless)     |
| Parsing  | cheerio (server-side HTML)          |
| Hosting  | Vercel (serverless functions)       |

## Getting Started

```bash
# Clone
git clone https://github.com/QaziNafay/seoscope.git
cd seoscope

# Install
npm install

# Dev server
npm run dev        # http://localhost:3000

# Production build
npm run build
npm start
```

## API

`POST /api/analyze`

```json
{ "url": "https://example.com" }
```

Returns the full `AnalysisResult` object with score, meta, headings, images, links, technical SEO, keywords, and recommendations.

## Deployment

Push to GitHub and import into [Vercel](https://vercel.com/new). Zero configuration required — Vercel auto-detects Next.js.

```bash
git push origin master
```

## Security

- **No data stored** — analyzed pages are fetched server-side and discarded immediately
- **Rate limited** — in-memory throttling on the API route (10 req/min per IP)
- **CSP headers** — served via `next.config.ts` and `vercel.json`
- **Input validation** — URLs are validated, normalized, and length-capped server-side
- **Timeout** — requests abort after 15 seconds to prevent abuse
- **Content-Type check** — non-HTML responses are rejected
- **HTTP status check** — non-200 responses return a clear error

See [SECURITY.md](./SECURITY.md) for the full security policy.

## License

MIT — see [LICENSE](./LICENSE).

---

<p align="center">Built with Next.js · Deploy on Vercel · Free forever</p>
