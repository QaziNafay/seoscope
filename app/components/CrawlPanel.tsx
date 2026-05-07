import type { CrawledPage } from "@/lib/types"

interface Props {
  pages: CrawledPage[]
}

export function CrawlPanel({ pages }: Props) {
  if (pages.length === 0) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
        Sitemap Pages ({pages.length})
      </h2>
      <div className="space-y-3">
        {pages.map((page, i) => (
          <div key={i} className="text-sm border-b border-gray-100 pb-2 last:border-0">
            <div className="font-medium text-gray-800 truncate">{page.title}</div>
            <div className="text-xs text-gray-400 truncate mt-0.5">{page.url}</div>
            <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
              <span>H1: {page.h1Count}</span>
              <span>{page.wordCount.toLocaleString()} words</span>
              <span className={page.hasCanonical ? "text-green-600" : "text-red-400"}>
                {page.hasCanonical ? "canonical ✓" : "no canonical"}
              </span>
              <span className={page.hasViewport ? "text-green-600" : "text-red-400"}>
                {page.hasViewport ? "viewport ✓" : "no viewport"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
