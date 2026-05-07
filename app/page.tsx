"use client"

import { useState, useCallback } from "react"
import type { AnalysisResult } from "@/lib/types"
import { UrlInput } from "@/app/components/UrlInput"
import { ScoreChart } from "@/app/components/ScoreChart"
import { MetaPanel } from "@/app/components/MetaPanel"
import { HeadingsPanel } from "@/app/components/HeadingsPanel"
import { ImagesPanel } from "@/app/components/ImagesPanel"
import { LinksPanel } from "@/app/components/LinksPanel"
import { TechnicalPanel } from "@/app/components/TechnicalPanel"
import { KeywordsPanel } from "@/app/components/KeywordsPanel"
import { RecommendationsPanel } from "@/app/components/RecommendationsPanel"
import { CoreWebVitalsPanel } from "@/app/components/CoreWebVitalsPanel"
import { FrameworkBanner } from "@/app/components/FrameworkBanner"
import { CrawlPanel } from "@/app/components/CrawlPanel"

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSitemap, setShowSitemap] = useState(false)
  const [sitemapUrl, setSitemapUrl] = useState("")

  const analyze = useCallback(async (url: string) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const body: Record<string, string> = { url }
      if (sitemapUrl.trim()) {
        let sm = sitemapUrl.trim()
        if (!/^https?:\/\//i.test(sm)) sm = "https://" + sm
        body.sitemap = sm
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Analysis failed")
      } else {
        setResult(data)
      }
    } catch {
      setError("Network error — check your connection")
    } finally {
      setLoading(false)
    }
  }, [sitemapUrl])

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          SEOScope
        </h1>
        <p className="mt-2 text-gray-500 text-lg">
          Paste a URL and get an instant SEO audit
        </p>
      </header>

      <UrlInput onSubmit={analyze} loading={loading} />

      <div className="max-w-2xl mx-auto mt-2">
        <button
          type="button"
          className="text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
          onClick={() => setShowSitemap(!showSitemap)}
        >
          {showSitemap ? "— Hide sitemap crawl" : "+ Add sitemap URL for multi-page crawl"}
        </button>
        {showSitemap && (
          <input
            type="text"
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
            placeholder="https://example.com/sitemap.xml"
            className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-10 text-center text-gray-400 animate-pulse">
          {sitemapUrl.trim() ? "Fetching page, PageSpeed, and sitemap…" : "Fetching and analyzing the page…"}
        </div>
      )}

      {result && (
        <div className="mt-10 space-y-6">
          {result.framework && <FrameworkBanner framework={result.framework} />}

          <ScoreChart score={result.score} loadTime={result.loadTime} wordCount={result.wordCount} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetaPanel meta={result.meta} />
            <TechnicalPanel technical={result.technical} />
            <HeadingsPanel headings={result.headings} />
            <ImagesPanel images={result.images} />
            <LinksPanel links={result.links} />
            <KeywordsPanel keywords={result.keywords} />
          </div>

          {result.coreWebVitals && (
            <CoreWebVitalsPanel vitals={result.coreWebVitals} />
          )}

          {result.crawledPages && <CrawlPanel pages={result.crawledPages} />}

          <RecommendationsPanel recommendations={result.recommendations} />
        </div>
      )}

      <footer className="mt-16 text-center text-xs text-gray-400">
        SEOScope — free tool. No data is stored.
      </footer>
    </main>
  )
}
