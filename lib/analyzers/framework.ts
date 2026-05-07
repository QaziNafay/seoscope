import * as cheerio from "cheerio"

export interface FrameworkResult {
  detected: boolean
  frameworks: string[]
  note: string
}

const PATTERNS: { name: string; check: ($: cheerio.CheerioAPI) => boolean }[] = [
  {
    name: "React",
    check: ($) =>
      $('script[src*="react"]').length > 0 ||
      $('[data-reactroot], [data-reactid]').length > 0 ||
      $('#__next').length > 0 ||
      $('script#__NEXT_DATA__').length > 0,
  },
  {
    name: "Vue",
    check: ($) =>
      $('script[src*="vue"]').length > 0 ||
      $('[data-v-]').length > 0 ||
      $('div#app').length > 0 ||
      $('script[src*="nuxt"]').length > 0,
  },
  {
    name: "Angular",
    check: ($) =>
      $('script[src*="angular"]').length > 0 ||
      $('[ng-app], [ng-controller]').length > 0 ||
      $('app-root').length > 0,
  },
  {
    name: "Svelte",
    check: ($) =>
      $('script[src*="svelte"]').length > 0 || $('[svelte-h]').length > 0,
  },
  {
    name: "jQuery",
    check: ($) => $('script[src*="jquery"]').length > 0,
  },
  {
    name: "Next.js",
    check: ($) => $('#__next').length > 0 || $('script#__NEXT_DATA__').length > 0,
  },
  {
    name: "Nuxt",
    check: ($) => $('script[src*="nuxt"]').length > 0 || $('#__nuxt').length > 0,
  },
  {
    name: "Gatsby",
    check: ($) => $('script[src*="gatsby"]').length > 0 || $('#___gatsby').length > 0,
  },
  {
    name: "Astro",
    check: ($) =>
      $('script[src*="astro"]').length > 0 ||
      $('meta[name="generator"][content*="astro"]').length > 0,
  },
]

export function detectFramework($: cheerio.CheerioAPI): FrameworkResult {
  const detected: string[] = []
  for (const { name, check } of PATTERNS) {
    if (check($) && !detected.includes(name)) detected.push(name)
  }

  const isSpa = detected.some((f) =>
    ["React", "Vue", "Angular", "Svelte"].includes(f)
  )

  return {
    detected: detected.length > 0,
    frameworks: detected,
    note: isSpa
      ? "This site uses a JavaScript framework and may render content client-side. SEOScope only analyzes the server-delivered HTML — some elements may not be captured."
      : detected.length > 0
        ? `Detected ${detected.join(", ")}. Content appears server-rendered.`
        : "No JS framework detected.",
  }
}
