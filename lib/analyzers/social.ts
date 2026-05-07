import * as cheerio from "cheerio"
import type { SocialResult } from "@/lib/types"

function metaContent(
  $: cheerio.CheerioAPI,
  selectors: string[]
): string | null {
  for (const sel of selectors) {
    const val = $(sel).attr("content")?.trim()
    if (val) return val
  }
  return null
}

export function analyzeSocial($: cheerio.CheerioAPI): SocialResult {
  return {
    ogTitle: metaContent($, [
      'meta[property="og:title"]',
      'meta[name="og:title"]',
    ]),
    ogDescription: metaContent($, [
      'meta[property="og:description"]',
      'meta[name="og:description"]',
    ]),
    ogImage: metaContent($, [
      'meta[property="og:image"]',
      'meta[name="og:image"]',
    ]),
    ogUrl: metaContent($, [
      'meta[property="og:url"]',
      'meta[name="og:url"]',
    ]),
    twitterCard: metaContent($, [
      'meta[name="twitter:card"]',
      'meta[property="twitter:card"]',
    ]),
    twitterTitle: metaContent($, [
      'meta[name="twitter:title"]',
      'meta[property="twitter:title"]',
    ]),
    twitterDescription: metaContent($, [
      'meta[name="twitter:description"]',
      'meta[property="twitter:description"]',
    ]),
    twitterImage: metaContent($, [
      'meta[name="twitter:image"]',
      'meta[property="twitter:image"]',
    ]),
  }
}
