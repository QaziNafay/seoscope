import * as cheerio from "cheerio"
import type { KeywordResult } from "@/lib/types"

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "by", "with", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "need",
  "dare", "ought", "used", "it", "its", "it's", "that", "this", "these",
  "those", "i", "you", "he", "she", "we", "they", "me", "him", "her",
  "us", "them", "my", "your", "his", "its", "our", "their", "not",
  "no", "nor", "so", "if", "then", "than", "too", "very", "just",
  "about", "above", "after", "again", "all", "also", "any", "because",
  "before", "between", "both", "each", "few", "more", "most", "other",
  "some", "such", "only", "own", "same", "into", "over", "under",
  "up", "out", "off", "down", "here", "there", "when", "where", "why",
  "how", "what", "which", "who", "whom", "while", "during", "through",
  "until", "against", "within", "without", "along", "around", "among",
])

export function analyzeKeywords(
  $: cheerio.CheerioAPI
): { keywords: KeywordResult[]; wordCount: number } {
  const $body = $("body").clone()
  $body.find("script, style, noscript, svg, canvas, template, [aria-hidden=true]").remove()
  const text = $body.text().toLowerCase()
  const words = text
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))

  const totalWords = words.length
  const freq = new Map<string, number>()
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1)
  }

  const sorted = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({
      word,
      count,
      density: totalWords > 0 ? parseFloat(((count / totalWords) * 100).toFixed(2)) : 0,
    }))

  return { keywords: sorted, wordCount: totalWords }
}
