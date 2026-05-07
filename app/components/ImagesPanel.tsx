import type { ImageResult } from "@/lib/types"

interface Props {
  images: ImageResult[]
}

export function ImagesPanel({ images }: Props) {
  const total = images.length
  const withAlt = images.filter((i) => i.hasAlt).length
  const missingAlt = total - withAlt
  const allMissing = total > 0 && missingAlt === total

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
        Images
      </h2>
      {total === 0 ? (
        <p className="text-sm text-gray-400 italic">No images found</p>
      ) : (
        <>
          <div className="flex gap-4 text-sm mb-3">
            <span>
              Total <strong>{total}</strong>
            </span>
            <span className={allMissing ? "text-red-500" : "text-green-600"}>
              Alt <strong>{withAlt}</strong>
            </span>
            {missingAlt > 0 && (
              <span className="text-yellow-600">
                Missing <strong>{missingAlt}</strong>
              </span>
            )}
          </div>
          <details>
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              Show images
            </summary>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {images.map((img, i) => (
                <div key={i} className="text-xs border-b border-gray-100 pb-1">
                  <div className="truncate text-gray-500">{img.src}</div>
                  <div className={img.hasAlt ? "text-gray-700" : "text-red-400"}>
                    {img.alt ?? "missing alt"}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </>
      )}
    </div>
  )
}
