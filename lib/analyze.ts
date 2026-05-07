import * as cheerio from "cheerio"
import type { AnalysisResult } from "@/lib/types"
import { analyzeMeta } from "@/lib/analyzers/meta"
import { analyzeHeadings } from "@/lib/analyzers/headings"
import { analyzeImages } from "@/lib/analyzers/images"
import { analyzeLinks } from "@/lib/analyzers/links"
import { analyzeSocial } from "@/lib/analyzers/social"
import { analyzeKeywords } from "@/lib/analyzers/keywords"

export async function analyzePage(url: string): Promise<AnalysisResult> {
  const start = performance.now()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  let html: string
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "SEOScope/1.0" },
      redirect: "follow",
    })
    html = await res.text()
  } finally {
    clearTimeout(timeout)
  }

  const loadTime = Math.round(performance.now() - start)
  const $ = cheerio.load(html)

  const meta = analyzeMeta($)
  const headings = analyzeHeadings($)
  const images = analyzeImages($)
  const links = analyzeLinks($, url)
  const social = analyzeSocial($)
  const { keywords, wordCount } = analyzeKeywords($)

  const issues: string[] = []
  let score = 100

  if (!meta.title || meta.titleLength === 0) {
    score -= 10
    issues.push("Missing <title> tag")
  } else if (meta.titleLength < 30) {
    score -= 5
    issues.push("Title tag is too short (under 30 characters)")
  } else if (meta.titleLength > 60) {
    score -= 5
    issues.push("Title tag is too long (over 60 characters)")
  }

  if (!meta.description) {
    score -= 10
    issues.push("Missing meta description")
  } else if (meta.descriptionLength < 50) {
    score -= 5
    issues.push("Meta description is too short (under 50 characters)")
  } else if (meta.descriptionLength > 160) {
    score -= 3
    issues.push("Meta description is too long (over 160 characters)")
  }

  if (!meta.canonical) {
    score -= 3
    issues.push("No canonical URL specified")
  }

  if (headings.h1.length === 0) {
    score -= 8
    issues.push("Missing H1 tag — every page needs exactly one H1")
  } else if (headings.h1.length > 1) {
    score -= 5
    issues.push(`Page has ${headings.h1.length} H1 tags (should be exactly 1)`)
  }

  if (headings.h2.length === 0) {
    score -= 3
    issues.push("No H2 headings found — consider adding section headings")
  }

  if (images.length > 0) {
    const missingAlt = images.filter((i) => !i.hasAlt).length
    if (missingAlt === images.length) {
      score -= 8
      issues.push("All images are missing alt text")
    } else if (missingAlt > 0) {
      score -= 4
      issues.push(`${missingAlt} of ${images.length} images missing alt text`)
    }
  }

  if (links.length === 0) {
    score -= 5
    issues.push("No links found on the page")
  } else {
    const nofollow = links.filter((l) => !l.isFollowable).length
    if (nofollow > links.length * 0.5) {
      score -= 3
      issues.push("More than half of links are nofollow")
    }
  }

  if (!social.ogTitle) {
    score -= 5
    issues.push("Missing Open Graph title (og:title) — needed for social sharing")
  }
  if (!social.ogDescription) {
    score -= 3
    issues.push("Missing Open Graph description (og:description)")
  }
  if (!social.ogImage) {
    score -= 3
    issues.push("Missing Open Graph image (og:image)")
  }

  if (!meta.viewport) {
    score -= 5
    issues.push("No viewport meta tag — page is not mobile-optimized")
  }

  if (wordCount < 300) {
    score -= 5
    issues.push(`Only ~${wordCount} words on the page — aim for at least 300`)
  }

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

  if (wordCount < 300) {
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
