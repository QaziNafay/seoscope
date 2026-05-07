import type { KeywordResult } from "@/lib/types"

interface Props {
  keywords: KeywordResult[]
}

export function KeywordsPanel({ keywords }: Props) {
  if (keywords.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
          Top Keywords
        </h2>
        <p className="text-sm text-gray-400 italic">Not enough content to extract keywords</p>
      </div>
    )
  }

  const maxCount = keywords[0].count

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
        Top Keywords
      </h2>
      <div className="space-y-1.5">
        {keywords.slice(0, 15).map((kw, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-6 text-right text-xs text-gray-400">{i + 1}</span>
            <span className="flex-1 truncate">{kw.word}</span>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(kw.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-12 text-right text-xs text-gray-400">
              {kw.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
