import * as cheerio from "cheerio"
import type { MetaResult } from "@/lib/types"

const CONTENT_TYPE_CHARSET_RE = /charset\s*=\s*([^\s;]+)/i

export function analyzeMeta($: cheerio.CheerioAPI, baseUrl: string): MetaResult {
  const title = $("title").first().text().trim() || null
  const description =
    $('meta[name="description"]').attr("content")?.trim() || null
  const keywords =
    $('meta[name="keywords"]').attr("content")?.trim() || null
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() || null
  const robots = $('meta[name="robots"]').attr("content")?.trim() || null
  const viewport = $('meta[name="viewport"]').attr("content")?.trim() || null

  let charset: string | null =
    $("meta[charset]").attr("charset")?.trim() || null
  if (!charset) {
    const ct = $('meta[http-equiv="Content-Type"]').attr("content") || ""
    const m = ct.match(CONTENT_TYPE_CHARSET_RE)
    charset = m ? m[1].toLowerCase() : null
  }

  let favicon: string | null =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    $('link[rel="apple-touch-icon"]').attr("href") ||
    null
  if (!favicon) {
    try {
      const origin = new URL(baseUrl).origin
      favicon = `${origin}/favicon.ico`
    } catch {
      favicon = null
    }
  }

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
