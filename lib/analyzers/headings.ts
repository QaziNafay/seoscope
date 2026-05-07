import * as cheerio from "cheerio"
import type { HeadingResult } from "@/lib/types"

export function analyzeHeadings($: cheerio.CheerioAPI): HeadingResult {
  const h1: string[] = []
  const h2: string[] = []
  const h3: string[] = []
  const issues: string[] = []

  $("h1, h2, h3").each((_, el) => {
    const tag = el.tagName.toLowerCase()
    const text = $(el).text().trim()
    if (!text) return
    if (tag === "h1") h1.push(text)
    else if (tag === "h2") h2.push(text)
    else if (tag === "h3") h3.push(text)
  })

  if (h1.length === 0) issues.push("No H1 tag found")
  else if (h1.length > 1) issues.push(`Found ${h1.length} H1 tags (should be exactly 1)`)

  if (h2.length === 0) issues.push("No H2 tags found")

  return { h1, h2, h3, issues }
}
