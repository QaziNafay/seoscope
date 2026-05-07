import * as cheerio from "cheerio"
import type { AnalysisResult } from "@/lib/types"
import { analyzeMeta } from "@/lib/analyzers/meta"
import { analyzeHeadings } from "@/lib/analyzers/headings"
import { analyzeImages } from "@/lib/analyzers/images"
import { analyzeLinks } from "@/lib/analyzers/links"
import { analyzeKeywords } from "@/lib/analyzers/keywords"
import { analyzeTechnical } from "@/lib/analyzers/technical"
import { detectFramework } from "@/lib/analyzers/framework"
import { analyzePageSpeed } from "@/lib/analyzers/pagespeed"
import { crawlSitemap } from "@/lib/analyzers/crawl"
import { cacheGet, cacheSet } from "@/lib/cache"

function getTotalWordCount($: cheerio.CheerioAPI): number {
  const $body = $("body").clone()
  $body.find("script, style, noscript, svg, canvas, template, [aria-hidden=true]").remove()
  const text = $body.text().toLowerCase()
  return text.split(/\s+/).filter((w) => w.length > 0).length
}

export async function analyzePage(
  url: string,
  sitemapUrl?: string
): Promise<AnalysisResult> {
  const cacheKey = url
  const cached = cacheGet(cacheKey)
  let html: string
  let responseHeaders: Record<string, string>
  let finalUrl: string
  let wasHttps: boolean
  let loadTime: number

  if (cached) {
    html = cached.html
    responseHeaders = cached.headers
    finalUrl = cached.url
    wasHttps = finalUrl.startsWith("https")
    loadTime = 0
  } else {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    try {
      const fetchStart = performance.now()
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "SEOScope/1.0" },
        redirect: "follow",
      })
      loadTime = Math.round(performance.now() - fetchStart)
      finalUrl = res.url
      wasHttps = finalUrl.startsWith("https")

      if (!res.ok) {
        throw new Error(`Server returned ${res.status} ${res.statusText}`)
      }

      const contentType = res.headers.get("content-type") || ""
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        throw new Error(`Not an HTML page (${contentType.split(";")[0] || "unknown type"})`)
      }

      html = await res.text()
      responseHeaders = Object.fromEntries(res.headers.entries())

      cacheSet(cacheKey, { html, headers: responseHeaders, url: finalUrl })
    } finally {
      clearTimeout(timeout)
    }
  }

  const $ = cheerio.load(html)

  const meta = analyzeMeta($, finalUrl)
  const headings = analyzeHeadings($)
  const images = analyzeImages($)
  const links = analyzeLinks($, finalUrl)
  const { keywords, wordCount } = analyzeKeywords($)
  const totalWords = getTotalWordCount($)
  const framework = detectFramework($)
  const technical = await analyzeTechnical(
    $,
    finalUrl,
    wasHttps,
    new Headers(responseHeaders),
    html.length
  )

  const [coreWebVitals, crawlResult] = await Promise.all([
    analyzePageSpeed(finalUrl),
    sitemapUrl ? crawlSitemap(sitemapUrl) : Promise.resolve(null),
  ])

  let score = 100
  const recommendations: string[] = []

  if (!meta.title || meta.titleLength === 0) {
    score -= 10
  } else if (meta.titleLength < 30) {
    score -= 5
  } else if (meta.titleLength > 60) {
    score -= 5
  }

  if (!meta.description) {
    score -= 10
  } else if (meta.descriptionLength < 50) {
    score -= 5
  } else if (meta.descriptionLength > 160) {
    score -= 3
  }

  if (!meta.canonical) {
    score -= 3
    recommendations.push("Add a canonical URL tag to prevent duplicate content issues")
  }

  if (headings.h1.length === 0) {
    score -= 8
  } else if (headings.h1.length > 1) {
    score -= 5
  }

  if (headings.h2.length === 0) score -= 3

  if (images.length > 0) {
    const missingAlt = images.filter((i) => !i.hasAlt).length
    if (missingAlt === images.length) {
      score -= 8
    } else if (missingAlt > 0) {
      score -= 4
    }
  }
  const noAltImages = images.filter((i) => !i.hasAlt)
  if (noAltImages.length > 0) {
    recommendations.push(`Add descriptive alt text to ${noAltImages.length} image(s)`)
  }

  if (links.length === 0) score -= 5

  if (!meta.viewport) {
    score -= 5
    recommendations.push("Add a viewport meta tag for mobile responsiveness")
  }

  if (totalWords < 300) {
    score -= 5
    recommendations.push("Add more content — aim for at least 300 words per page")
  }

  if (!wasHttps) {
    score -= 8
    recommendations.push("Switch to HTTPS — it's a ranking signal and required for browser trust")
  }

  const noindex = technical.items.find((i) => i.label === "Crawlability")
  if (noindex?.status === "fail") {
    score -= 10
    recommendations.push("Remove 'noindex' from the robots meta tag so search engines can index this page")
  }

  if (coreWebVitals?.score !== null && coreWebVitals.score < 50) {
    score -= 5
    recommendations.push("Improve Core Web Vitals — your PageSpeed score is low, which impacts search ranking")
  }

  score = Math.max(0, score)

  if (!meta.title) {
    recommendations.unshift("Add a unique, descriptive <title> tag (50-60 characters)")
  } else if (meta.titleLength > 60) {
    recommendations.unshift(`Shorten the title from ${meta.titleLength} to under 60 characters`)
  }

  if (!meta.description) {
    recommendations.unshift("Add a meta description (120-160 characters summarizing the page)")
  } else if (meta.descriptionLength > 160) {
    recommendations.unshift(`Trim the meta description from ${meta.descriptionLength} to under 160 characters`)
  }

  if (headings.h1.length === 0) {
    recommendations.unshift("Add one H1 tag that matches the page topic")
  } else if (headings.h1.length > 1) {
    recommendations.unshift("Keep only one H1 tag and change the rest to H2 or lower")
  }

  return {
    url: finalUrl,
    score,
    meta,
    headings,
    images,
    links,
    technical,
    keywords,
    wordCount,
    recommendations,
    loadTime,
    coreWebVitals,
    framework,
    crawledPages: crawlResult?.pages ?? null,
  }
}
