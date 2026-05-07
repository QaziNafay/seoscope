import * as cheerio from "cheerio"
import type { AnalysisResult } from "@/lib/types"
import { analyzeMeta } from "@/lib/analyzers/meta"
import { analyzeHeadings } from "@/lib/analyzers/headings"
import { analyzeImages } from "@/lib/analyzers/images"
import { analyzeLinks } from "@/lib/analyzers/links"
import { analyzeSocial } from "@/lib/analyzers/social"
import { analyzeKeywords } from "@/lib/analyzers/keywords"

function getTotalWordCount($: cheerio.CheerioAPI): number {
  const $body = $("body").clone()
  $body.find("script, style, noscript, svg, canvas, template, [aria-hidden=true]").remove()
  const text = $body.text().toLowerCase()
  return text.split(/\s+/).filter((w) => w.length > 0).length
}

export async function analyzePage(url: string): Promise<AnalysisResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  let html: string
  let loadTime: number
  try {
    const fetchStart = performance.now()
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "SEOScope/1.0" },
      redirect: "follow",
    })
    loadTime = Math.round(performance.now() - fetchStart)

    if (!res.ok) {
      throw new Error(`Server returned ${res.status} ${res.statusText}`)
    }

    const contentType = res.headers.get("content-type") || ""
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new Error(`Not an HTML page (${contentType.split(";")[0] || "unknown type"})`)
    }

    html = await res.text()
  } finally {
    clearTimeout(timeout)
  }

  const $ = cheerio.load(html)

  const meta = analyzeMeta($, url)
  const headings = analyzeHeadings($)
  const images = analyzeImages($)
  const links = analyzeLinks($, url)
  const social = analyzeSocial($)
  const { keywords, wordCount } = analyzeKeywords($)
  const totalWords = getTotalWordCount($)

  let score = 100

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

  if (!meta.canonical) score -= 3

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

  if (links.length === 0) {
    score -= 5
  } else {
    const nofollow = links.filter((l) => !l.isFollowable).length
    if (nofollow > links.length * 0.5) {
      score -= 3
    }
  }

  if (!social.ogTitle) score -= 5
  if (!social.ogDescription) score -= 3
  if (!social.ogImage) score -= 3

  if (!meta.viewport) score -= 5

  if (totalWords < 300) score -= 5

  score = Math.max(0, score)

  const recommendations: string[] = []
  if (!meta.title) {
    recommendations.push("Add a unique, descriptive <title> tag (50-60 characters)")
  } else if (meta.titleLength > 60) {
    recommendations.push(`Shorten the title from ${meta.titleLength} to under 60 characters`)
  }

  if (!meta.description) {
    recommendations.push("Add a meta description (120-160 characters summarizing the page)")
  } else if (meta.descriptionLength > 160) {
    recommendations.push(`Trim the meta description from ${meta.descriptionLength} to under 160 characters`)
  }

  if (headings.h1.length === 0) {
    recommendations.push("Add one H1 tag that matches the page topic")
  } else if (headings.h1.length > 1) {
    recommendations.push("Keep only one H1 tag and change the rest to H2 or lower")
  }

  const noAltImages = images.filter((i) => !i.hasAlt)
  if (noAltImages.length > 0) {
    recommendations.push(`Add descriptive alt text to ${noAltImages.length} image(s)`)
  }

  if (!social.ogTitle) {
    recommendations.push("Add og:title meta tag for better social media previews")
  }
  if (!social.ogImage) {
    recommendations.push("Add og:image meta tag so links show a preview image when shared")
  }

  if (!meta.canonical) {
    recommendations.push("Add a canonical URL tag to prevent duplicate content issues")
  }

  if (!meta.viewport) {
    recommendations.push("Add a viewport meta tag for mobile responsiveness")
  }

  if (totalWords < 300) {
    recommendations.push("Add more content — aim for at least 300 words per page")
  }

  return {
    url,
    score,
    meta,
    headings,
    images,
    links,
    social,
    keywords,
    wordCount,
    recommendations,
    loadTime,
  }
}
