import * as cheerio from "cheerio"
import type { SocialResult } from "@/lib/types"

export function analyzeSocial($: cheerio.CheerioAPI): SocialResult {
  return {
    ogTitle: $('meta[property="og:title"]').attr("content")?.trim() || null,
    ogDescription:
      $('meta[property="og:description"]').attr("content")?.trim() || null,
    ogImage: $('meta[property="og:image"]').attr("content")?.trim() || null,
    ogUrl: $('meta[property="og:url"]').attr("content")?.trim() || null,
    twitterCard:
      $('meta[name="twitter:card"]').attr("content")?.trim() || null,
    twitterTitle:
      $('meta[name="twitter:title"]').attr("content")?.trim() || null,
    twitterDescription:
      $('meta[name="twitter:description"]').attr("content")?.trim() || null,
    twitterImage:
      $('meta[name="twitter:image"]').attr("content")?.trim() || null,
  }
}
