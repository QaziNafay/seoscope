import type { CoreWebVitals } from "@/lib/types"

interface Props {
  vitals: CoreWebVitals
}

function CWVBadge({ label, value, ok }: { label: string; value: string | null; ok: boolean }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${value === null ? "text-gray-300" : ok ? "text-green-600" : "text-red-500"}`}>
        {value ?? "—"}
      </div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}

export function CoreWebVitalsPanel({ vitals }: Props) {
  if (vitals.score === null && !vitals.lcp && !vitals.cls && !vitals.inp) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
          Core Web Vitals
        </h2>
        <p className="text-xs text-gray-400 italic">
          Could not fetch PageSpeed data. The API may be unavailable or the page is unreachable.
        </p>
      </div>
    )
  }

  const lcpOk = vitals.lcp ? parseFloat(vitals.lcp) <= 2.5 : true
  const clsOk = vitals.cls ? parseFloat(vitals.cls) <= 0.1 : true
  const inpOk = vitals.inp ? parseFloat(vitals.inp) <= 200 : true
  const scoreOk = vitals.score !== null && vitals.score >= 90

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
        Core Web Vitals
      </h2>
      {vitals.score !== null && (
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className={`text-2xl font-bold ${scoreOk ? "text-green-600" : vitals.score >= 50 ? "text-yellow-500" : "text-red-500"}`}>
            {vitals.score}
          </div>
          <div className="text-xs text-gray-400">PageSpeed Score</div>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${scoreOk ? "bg-green-500" : vitals.score >= 50 ? "bg-yellow-400" : "bg-red-500"}`} style={{ width: `${vitals.score}%` }} />
          </div>
        </div>
      )}
      <div className="flex justify-around">
        <CWVBadge label="LCP" value={vitals.lcp} ok={lcpOk} />
        <CWVBadge label="CLS" value={vitals.cls} ok={clsOk} />
        <CWVBadge label="INP" value={vitals.inp} ok={inpOk} />
      </div>
      <div className="mt-3 text-xs text-gray-400 text-center">
        LCP ≤ 2.5s &nbsp;·&nbsp; CLS ≤ 0.1 &nbsp;·&nbsp; INP ≤ 200ms
      </div>
    </div>
  )
}
