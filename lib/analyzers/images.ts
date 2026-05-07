import * as cheerio from "cheerio"
import type { ImageResult } from "@/lib/types"

export function analyzeImages($: cheerio.CheerioAPI): ImageResult[] {
  const results: ImageResult[] = []

  $("img").each((_, el) => {
    const src = $(el).attr("src") || ""
    if (!src) return
    const alt = $(el).attr("alt")?.trim() || null
    results.push({ src, alt, hasAlt: alt !== null && alt.length > 0 })
  })

  return results
}
