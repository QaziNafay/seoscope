interface Props {
  recommendations: string[]
}

export function RecommendationsPanel({ recommendations }: Props) {
  if (recommendations.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <p className="text-green-700 font-medium">No major issues found — great job!</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
        Recommendations ({recommendations.length})
      </h2>
      <ul className="space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-500 mt-0.5 shrink-0">→</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
