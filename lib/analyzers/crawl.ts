import * as cheerio from "cheerio"

export interface CrawledPage {
  url: string
  title: string
  description: string
  h1Count: number
  wordCount: number
  hasCanonical: boolean
  hasViewport: boolean
}

export interface CrawlResult {
  urls: string[]
  pages: CrawledPage[]
  error: string | null
}

export async function crawlSitemap(sitemapUrl: string): Promise<CrawlResult> {
  let xml: string
  try {
    const res = await fetch(sitemapUrl, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return { urls: [], pages: [], error: `Sitemap returned ${res.status}` }
    const ct = res.headers.get("content-type") || ""
    if (!ct.includes("xml")) return { urls: [], pages: [], error: "Not an XML sitemap" }
    xml = await res.text()
  } catch {
    return { urls: [], pages: [], error: "Failed to fetch sitemap" }
  }

  const urls: string[] = []
  const locRe = /<loc>\s*([^<]+?)\s*<\/loc>/gi
  let match
  while ((match = locRe.exec(xml)) !== null && urls.length < 5) {
    const u = match[1].trim()
    if (u) urls.push(u)
  }

  if (urls.length === 0) {
    return { urls: [], pages: [], error: "No URLs found in sitemap" }
  }

  const pages: CrawledPage[] = await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(8000),
          headers: { "User-Agent": "SEOScope/1.0" },
        })
        const html = await res.text()
        const $ = cheerio.load(html)
        return {
          url,
          title: $("title").first().text().trim() || "(no title)",
          description: $('meta[name="description"]').attr("content")?.trim() || "",
          h1Count: $("h1").length,
          wordCount: $("body").text().split(/\s+/).filter(Boolean).length,
          hasCanonical: $('link[rel="canonical"]').length > 0,
          hasViewport: $('meta[name="viewport"]').length > 0,
        }
      } catch {
        return {
          url,
          title: "(fetch failed)",
          description: "",
          h1Count: 0,
          wordCount: 0,
          hasCanonical: false,
          hasViewport: false,
        }
      }
    })
  )

  return { urls, pages, error: null }
}
