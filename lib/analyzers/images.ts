import * as cheerio from "cheerio"
import type { ImageResult } from "@/lib/types"

export function analyzeImages($: cheerio.CheerioAPI): ImageResult[] {
  const results: ImageResult[] = []

  $("img").each((_, el) => {
    const src = $(el).attr("src") || ""
    if (!src || src.startsWith("data:")) return

    const alt = $(el).attr("alt")
    const hasAlt = alt !== undefined
    results.push({
      src,
      alt: alt?.trim() ?? null,
      hasAlt,
    })
  })

  return results
}
