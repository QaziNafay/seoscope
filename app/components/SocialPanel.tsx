import type { SocialResult } from "@/lib/types"

interface Props {
  social: SocialResult
}

export function SocialPanel({ social }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
        Social / Open Graph
      </h2>
      <div className="space-y-2 text-sm">
        <Row label="og:title" value={social.ogTitle} />
        <Row label="og:desc" value={social.ogDescription} />
        <Row label="og:image" value={social.ogImage} />
        <Row label="twitter:card" value={social.twitterCard} />
        <Row label="twitter:title" value={social.twitterTitle} />
        <Row label="twitter:desc" value={social.twitterDescription} />
        <Row label="twitter:image" value={social.twitterImage} />
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span
        className={`text-right truncate max-w-[60%] ${
          value === null ? "text-red-400 italic" : "text-gray-800"
        }`}
      >
        {value ?? "missing"}
      </span>
    </div>
  )
}
