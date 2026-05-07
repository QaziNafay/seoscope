import type { LinkResult } from "@/lib/types"

interface Props {
  links: LinkResult[]
}

export function LinksPanel({ links }: Props) {
  const internal = links.filter((l) => l.isInternal).length
  const external = links.filter((l) => !l.isInternal).length
  const nofollow = links.filter((l) => !l.isFollowable).length

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
        Links
      </h2>
      {links.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No links found</p>
      ) : (
        <>
          <div className="flex gap-4 text-sm mb-3 flex-wrap">
            <span>Total <strong>{links.length}</strong></span>
            <span className="text-blue-600">Internal <strong>{internal}</strong></span>
            <span className="text-purple-600">External <strong>{external}</strong></span>
            {nofollow > 0 && (
              <span className="text-gray-400">Nofollow <strong>{nofollow}</strong></span>
            )}
          </div>
          <details>
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              Show links
            </summary>
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {links.map((link, i) => (
                <div key={i} className="text-xs border-b border-gray-100 pb-1 truncate">
                  <span className={link.isInternal ? "text-blue-600" : "text-purple-600"}>
                    [{link.isInternal ? "INT" : "EXT"}]
                  </span>{" "}
                  <span className="text-gray-500">{link.href}</span>
                </div>
              ))}
            </div>
          </details>
        </>
      )}
    </div>
  )
}
