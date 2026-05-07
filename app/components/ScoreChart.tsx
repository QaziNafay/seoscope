interface Props {
  score: number
  loadTime: number
  wordCount: number
}

function getColor(score: number): string {
  if (score >= 80) return "text-green-600"
  if (score >= 50) return "text-yellow-500"
  return "text-red-500"
}

function getBarColor(score: number): string {
  if (score >= 80) return "bg-green-500"
  if (score >= 50) return "bg-yellow-400"
  return "bg-red-500"
}

export function ScoreChart({ score, loadTime, wordCount }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-8 flex-wrap">
        <div className="text-center">
          <div className={`text-6xl font-bold ${getColor(score)}`}>{score}</div>
          <div className="text-sm text-gray-400 mt-1">/ 100</div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getBarColor(score)}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-400">Load time </span>
            <span className="font-medium">{loadTime}ms</span>
          </div>
          <div>
            <span className="text-gray-400">Words </span>
            <span className="font-medium">{wordCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
