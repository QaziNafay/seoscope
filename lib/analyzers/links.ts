import * as cheerio from "cheerio"
import type { LinkResult } from "@/lib/types"

export function analyzeLinks($: cheerio.CheerioAPI, baseUrl: string): LinkResult[] {
  const results: LinkResult[] = []
  let baseHostname = ""
  try {
    baseHostname = new URL(baseUrl).hostname
  } catch {
    baseHostname = baseUrl
  }

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim()
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("javascript:") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("sms:")
    ) return

    const text = $(el).text().trim().slice(0, 100) || href

    let isInternal = false
    try {
      const linkHostname = new URL(href, baseUrl).hostname
      isInternal = linkHostname === baseHostname
    } catch {
      isInternal = true
    }

    const rel = $(el).attr("rel") || ""
    const isFollowable = !rel.includes("nofollow") && !rel.includes("ugc") && !rel.includes("sponsored")

    results.push({ href, text, isInternal, isFollowable })
  })

  return results
}
