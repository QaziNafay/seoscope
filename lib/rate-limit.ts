const rateMap = new Map<string, { count: number; resetAt: number }>()
let cleanupInterval: ReturnType<typeof setInterval> | null = null

function startCleanup(): void {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateMap) {
      if (now > entry.resetAt) rateMap.delete(key)
    }
    if (rateMap.size === 0 && cleanupInterval) {
      clearInterval(cleanupInterval)
      cleanupInterval = null
    }
  }, 60_000)
}

export function rateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const entry = rateMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs })
    startCleanup()
    return true
  }

  if (entry.count >= maxRequests) return false

  entry.count++
  return true
}
