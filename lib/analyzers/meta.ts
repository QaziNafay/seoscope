import * as cheerio from "cheerio"
import type { MetaResult } from "@/lib/types"

export function analyzeMeta($: cheerio.CheerioAPI): MetaResult {
  const title = $("title").first().text().trim() || null
  const description =
    $('meta[name="description"]').attr("content")?.trim() || null
  const keywords =
    $('meta[name="keywords"]').attr("content")?.trim() || null
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() || null
  const robots = $('meta[name="robots"]').attr("content")?.trim() || null
  const viewport = $('meta[name="viewport"]').attr("content")?.trim() || null
  const charset =
    $('meta[charset]').attr("charset") || $('meta[http-equiv="Content-Type"]').attr("content") || null
  const favicon =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    null

  return {
    title,
    titleLength: title?.length ?? 0,
    description,
    descriptionLength: description?.length ?? 0,
    keywords,
    canonical,
    robots,
    viewport,
    charset,
    favicon,
  }
}
