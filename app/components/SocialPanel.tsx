import type { SocialResult } from "@/lib/types"

interface Props {
  social: SocialResult
}

export function SocialPanel({ social }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
      <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
        Social Preview
      </h2>

      <OpenGraphPreview social={social} />
      <TwitterPreview social={social} />

      <div className="grid grid-cols-2 gap-3 text-xs">
        <StatusBadge
          label="og:title"
          ok={!!social.ogTitle}
        />
        <StatusBadge
          label="og:description"
          ok={!!social.ogDescription}
        />
        <StatusBadge
          label="og:image"
          ok={!!social.ogImage}
        />
        <StatusBadge
          label="twitter:card"
          ok={!!social.twitterCard}
        />
        <StatusBadge
          label="twitter:title"
          ok={!!social.twitterTitle}
        />
        <StatusBadge
          label="twitter:description"
          ok={!!social.twitterDescription}
        />
        <StatusBadge
          label="twitter:image"
          ok={!!social.twitterImage}
        />
      </div>
    </div>
  )
}

function OpenGraphPreview({ social }: { social: SocialResult }) {
  if (!social.ogTitle && !social.ogDescription && !social.ogImage) {
    return (
      <div className="text-xs text-red-400 italic">
        No Open Graph tags found — links will lack rich previews when shared.
      </div>
    )
  }

  return (
    <div>
      <div className="text-xs text-gray-400 mb-1 font-medium">Open Graph</div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {social.ogImage && (
          <div className="h-36 bg-gray-100 overflow-hidden">
            <img
              src={social.ogImage}
              alt="og:image preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none"
              }}
            />
          </div>
        )}
        <div className="p-3 space-y-1">
          {social.ogTitle && (
            <div className="font-semibold text-sm text-gray-900 leading-tight">
              {social.ogTitle}
            </div>
          )}
          {social.ogDescription && (
            <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {social.ogDescription}
            </div>
          )}
          {social.ogUrl && (
            <div className="text-xs text-gray-400 truncate">
              {social.ogUrl.replace(/^https?:\/\//, "")}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TwitterPreview({ social }: { social: SocialResult }) {
  if (!social.twitterTitle && !social.twitterDescription && !social.twitterImage) {
    return null
  }

  return (
    <div>
      <div className="text-xs text-gray-400 mb-1 font-medium">
        Twitter Card
        {social.twitterCard && (
          <span className="ml-1 text-gray-300">({social.twitterCard})</span>
        )}
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        {social.twitterImage && (
          <div className="h-32 bg-gray-100 overflow-hidden">
            <img
              src={social.twitterImage}
              alt="twitter:image preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none"
              }}
            />
          </div>
        )}
        <div className="p-3 space-y-1">
          {social.twitterTitle && (
            <div className="font-semibold text-sm text-gray-900 leading-tight">
              {social.twitterTitle}
            </div>
          )}
          {social.twitterDescription && (
            <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {social.twitterDescription}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
          ok ? "bg-green-400" : "bg-red-300"
        }`}
      />
      <span className={ok ? "text-gray-500" : "text-red-400 italic"}>
        {label}
      </span>
    </div>
  )
}
