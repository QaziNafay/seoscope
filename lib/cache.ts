interface CacheEntry {
  html: string
  headers: Record<string, string>
  url: string
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const MAX = 50

export function cacheGet(key: string): CacheEntry | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return undefined
  }
  return entry
}

export function cacheSet(key: string, entry: Omit<CacheEntry, "expiresAt">): void {
  if (cache.size >= MAX) {
    const oldest = cache.keys().next().value
    if (oldest) cache.delete(oldest)
  }
  cache.set(key, { ...entry, expiresAt: Date.now() + 60_000 })
}

export function cacheClear(): void {
  cache.clear()
}
