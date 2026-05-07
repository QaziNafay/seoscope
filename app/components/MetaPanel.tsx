import type { MetaResult } from "@/lib/types"

interface Props {
  meta: MetaResult
}

export function MetaPanel({ meta }: Props) {
  return (
    <Panel title="Meta Tags">
      <Row label="Title" value={meta.title} />
      {meta.title && (
        <Row
          label="Title length"
          value={`${meta.titleLength} chars`}
          warn={meta.titleLength < 30 || meta.titleLength > 60}
        />
      )}
      <Row label="Description" value={meta.description} />
      {meta.description && (
        <Row
          label="Desc. length"
          value={`${meta.descriptionLength} chars`}
          warn={meta.descriptionLength < 50 || meta.descriptionLength > 160}
        />
      )}
      <Row label="Keywords" value={meta.keywords} />
      <Row label="Canonical" value={meta.canonical} />
      <Row label="Robots" value={meta.robots} />
      <Row label="Viewport" value={meta.viewport} />
      <Row label="Charset" value={meta.charset} />
    </Panel>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
        {title}
      </h2>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  )
}

function Row({
  label,
  value,
  warn,
}: {
  label: string
  value: string | null | number
  warn?: boolean
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span
        className={`text-right truncate max-w-[60%] ${
          value === null
            ? "text-red-400 italic"
            : warn
              ? "text-yellow-600"
              : "text-gray-800"
        }`}
      >
        {value ?? "missing"}
      </span>
    </div>
  )
}
