import * as cheerio from "cheerio"
import type { TechnicalSeoResult, TechnicalSeoItem } from "@/lib/types"

export async function analyzeTechnical(
  $: cheerio.CheerioAPI,
  url: string,
  wasHttps: boolean,
  headers: Headers,
  htmlSize: number
): Promise<TechnicalSeoResult> {
  const items: TechnicalSeoItem[] = []

  // 1 — HTTPS
  if (wasHttps) {
    items.push({
      label: "HTTPS",
      status: "pass",
      value: "Served over HTTPS",
      detail: "The page is served over a secure HTTPS connection, which is required for SEO and user trust. Browsers mark HTTP pages as 'Not Secure'.",
    })
  } else {
    items.push({
      label: "HTTPS",
      status: "fail",
      value: "Served over HTTP",
      detail: "The page is served over plain HTTP. Switch to HTTPS to encrypt data and avoid browser security warnings. Many ranking signals require HTTPS.",
    })
  }

  // 2 — Page size
  const sizeKb = (htmlSize / 1024).toFixed(1)
  const sizeStatus = htmlSize < 100 * 1024 ? "pass" : htmlSize < 300 * 1024 ? "warn" : "fail"
  items.push({
    label: "Page Size",
    status: sizeStatus,
    value: `${sizeKb} KB`,
    detail:
      htmlSize < 100 * 1024
        ? `The raw HTML is ${sizeKb} KB — well under the recommended 100 KB. Good for fast loading.`
        : htmlSize < 300 * 1024
          ? `The raw HTML is ${sizeKb} KB. Consider trimming unnecessary markup, whitespace, or inline resources.`
          : `The raw HTML is ${sizeKb} KB — very large. This delays rendering. Move non-critical code to external files.`,
  })

  // 3 — Compression
  const ce = (headers.get("content-encoding") || "").toLowerCase()
  const isCompressed = ce.includes("gzip") || ce.includes("br") || ce.includes("deflate")
  items.push({
    label: "Compression",
    status: isCompressed ? "pass" : "warn",
    value: isCompressed ? ce.toUpperCase() : "None detected",
    detail: isCompressed
      ? `Server uses ${ce.toUpperCase()} compression. This reduces bandwidth by ~70%.`
      : "No compression detected. Enable gzip or Brotli on your server to reduce transfer size significantly.",
  })

  // 4 — Structured data
  let structuredCount = 0
  const details: string[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).text().trim()
    if (content) {
      structuredCount++
      try {
        const parsed = JSON.parse(content)
        const types = Array.isArray(parsed["@graph"])
          ? parsed["@graph"].map((g: Record<string, string>) => g["@type"]).filter(Boolean)
          : parsed["@type"]
            ? [parsed["@type"]]
            : []
        if (types.length) details.push(types.join(", "))
        else details.push("JSON-LD block")
      } catch {
        details.push("JSON-LD (unparseable)")
      }
    }
  })
  items.push({
    label: "Structured Data",
    status: structuredCount > 0 ? "pass" : "info",
    value: structuredCount > 0 ? `${structuredCount} block(s) found` : "None found",
    detail:
      structuredCount > 0
        ? `Found ${structuredCount} structured data block(s): ${details.join("; ")}. Structured data helps search engines understand your content and enables rich results.`
        : "No structured data (JSON-LD / Schema.org) found. Adding it can improve search visibility with rich snippets.",
  })

  // 5 — Crawlability
  const robotsMeta = $('meta[name="robots"]').attr("content")?.toLowerCase() || ""
  const noindex = robotsMeta.includes("noindex")
  const nofollow = robotsMeta.includes("nofollow")
  items.push({
    label: "Crawlability",
    status: noindex ? "fail" : "pass",
    value: robotsMeta || "index, follow (default)",
    detail: noindex
      ? `The robots meta tag is set to "${robotsMeta}". Search engines will NOT index this page. Remove 'noindex' if you want the page to appear in search results.`
      : nofollow
        ? `The robots meta tag is set to "${robotsMeta}". The page can be indexed but links won't be followed.`
        : "The page is crawlable (index, follow). Search engines can index this page and follow its links.",
  })

  // 6 — Doctype
  const htmlRaw = $.html()
  const hasDoctype = /^<!DOCTYPE html>/i.test(htmlRaw.trim())
  items.push({
    label: "Doctype",
    status: hasDoctype ? "pass" : "warn",
    value: hasDoctype ? "HTML5 doctype declared" : "Missing or non-standard",
    detail: hasDoctype
      ? "The page declares `<!DOCTYPE html>`, which triggers standards mode in all modern browsers."
      : "Missing or incorrect `<!DOCTYPE html>` declaration. This may trigger quirks mode in older browsers.",
  })

  // 7 — Language
  const lang = $("html").attr("lang") || $("html").attr("xml:lang") || null
  items.push({
    label: "Language",
    status: lang ? "pass" : "warn",
    value: lang ?? "Not set",
    detail: lang
      ? `The page language is set to "${lang}". This helps search engines and assistive technologies interpret the content correctly.`
      : "No `lang` attribute on the `<html>` tag. Add one (e.g. `lang=\"en\"`) for accessibility and SEO.",
  })

  // 8 — Hreflang
  const hreflangTags: string[] = []
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const h = $(el).attr("hreflang")
    const href = $(el).attr("href")
    if (h && href) hreflangTags.push(`${h}: ${href}`)
  })
  items.push({
    label: "Hreflang",
    status: hreflangTags.length > 0 ? "pass" : "info",
    value: hreflangTags.length > 0 ? `${hreflangTags.length} tag(s)` : "None found",
    detail:
      hreflangTags.length > 0
        ? `Found ${hreflangTags.length} hreflang tag(s): ${hreflangTags.join("; ")}. These help serve the correct language/regional version in search results.`
        : "No hreflang tags found. These are only needed if you have multilingual or multi-regional content.",
  })

  // 9 — HTTP protocol
  const protocol = wasHttps ? "https" : "http"
  const via = headers.get("via") || ""
  const cfProto = headers.get("cf-http2") || headers.get("cf-http3") || ""
  let protoLabel = protocol.toUpperCase()
  if (cfProto) protoLabel = `HTTP/${cfProto}`
  else if (via.includes("h2") || via.includes("http/2")) protoLabel = "HTTP/2"
  items.push({
    label: "HTTP Protocol",
    status: "info",
    value: protoLabel,
    detail:
      protoLabel.includes("3")
        ? "The page is served over HTTP/3 (QUIC), the latest protocol for faster, more reliable connections."
        : protoLabel.includes("2")
          ? "The page is served over HTTP/2, which supports multiplexing and header compression."
          : "The page appears to be served over HTTP/1.x. Upgrading to HTTP/2 can improve loading performance.",
  })

  // 10 — Sitemap check
  let sitemapFound = false
  let sitemapUrl = ""
  try {
    const origin = new URL(url).origin
    sitemapUrl = `${origin}/sitemap.xml`
    const sitemapRes = await fetch(sitemapUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
    })
    sitemapFound = sitemapRes.ok
  } catch {
    sitemapFound = false
  }
  items.push({
    label: "Sitemap",
    status: sitemapFound ? "pass" : "info",
    value: sitemapFound ? `${sitemapUrl} accessible` : "Not found at /sitemap.xml",
    detail: sitemapFound
      ? `A sitemap was found at ${sitemapUrl}. Submit it in Google Search Console to help discovery.`
      : "No sitemap found at the standard location. Sitemaps help search engines discover all your pages.",
  })

  return { items }
}
