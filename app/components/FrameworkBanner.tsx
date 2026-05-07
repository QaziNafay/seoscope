import type { FrameworkInfo } from "@/lib/types"

interface Props {
  framework: FrameworkInfo
}

export function FrameworkBanner({ framework }: Props) {
  if (!framework.detected) return null

  const isSpa = framework.frameworks.some((f) =>
    ["React", "Vue", "Angular", "Svelte"].includes(f)
  )

  return (
    <div className={`rounded-xl p-4 text-sm flex items-start gap-3 ${isSpa ? "bg-amber-50 border border-amber-200" : "bg-blue-50 border border-blue-200"}`}>
      <span className="shrink-0 mt-0.5">{isSpa ? "⚠️" : "ℹ️"}</span>
      <div>
        <span className="font-medium">{framework.frameworks.join(", ")}</span>
        <span className={isSpa ? "text-amber-700" : "text-blue-700"}>
          {" "}— {framework.note}
        </span>
      </div>
    </div>
  )
}
