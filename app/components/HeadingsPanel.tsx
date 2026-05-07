import type { HeadingResult } from "@/lib/types"

function Badge({ label, count, warn }: { label: string; count: number; warn?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded font-semibold">
        {label}
      </span>
      <span className={`text-sm ${count === 0 ? "text-red-400" : warn ? "text-yellow-600" : "text-gray-800"}`}>
        {count}
      </span>
    </div>
  )
}

interface Props {
  headings: HeadingResult
}

export function HeadingsPanel({ headings }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
        Headings
      </h2>
      <div className="flex gap-4 mb-3">
        <Badge label="H1" count={headings.h1.length} warn={headings.h1.length !== 1} />
        <Badge label="H2" count={headings.h2.length} warn={headings.h2.length === 0} />
        <Badge label="H3" count={headings.h3.length} />
      </div>
      {headings.issues.length > 0 && (
        <ul className="space-y-1">
          {headings.issues.map((issue, i) => (
            <li key={i} className="text-xs text-red-500 flex items-start gap-1">
              <span>•</span>
              <span>{issue}</span>
            </li>
          ))}
        </ul>
      )}
      {headings.h1.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
            Show headings
          </summary>
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
            {[...headings.h1, ...headings.h2, ...headings.h3].map((h, i) => (
              <div key={i} className="text-xs text-gray-600 truncate">
                {h}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
