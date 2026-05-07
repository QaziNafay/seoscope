export interface PageSpeedResult {
  lcp: string | null
  cls: string | null
  inp: string | null
  score: number | null
}

export async function analyzePageSpeed(url: string): Promise<PageSpeedResult> {
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&strategy=mobile`

  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return { lcp: null, cls: null, inp: null, score: null }

    const data = await res.json()
    const audits = data?.lighthouseResult?.audits
    const score = data?.lighthouseResult?.categories?.performance?.score ?? null

    return {
      lcp: audits?.["largest-contentful-paint"]?.displayValue ?? null,
      cls: audits?.["cumulative-layout-shift"]?.displayValue ?? null,
      inp: audits?.["interaction-to-next-paint"]?.displayValue ?? null,
      score: score !== null ? Math.round(score * 100) : null,
    }
  } catch {
    return { lcp: null, cls: null, inp: null, score: null }
  }
}
