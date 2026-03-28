import type { SlugVerificationResponse } from '@api/tenant'

export type SlugBlockReason = 'forbidden'

export interface SlugCacheEntry {
  slug: string
  isValid: boolean
  data?: SlugVerificationResponse
  /** When invalid: guest site not open (HTTP 403, API codes, or flags on payload). */
  blockReason?: SlugBlockReason
  timestamp: number
}

/** Bumped when cache semantics change so stale “invalid without blockReason” entries are not reused. */
const CACHE_PREFIX = 'slug_verification_v2_'
/** Legacy prefix (pre-v2): still cleared when clearing by slug so users aren’t stuck on old 404. */
const CACHE_PREFIX_LEGACY = 'slug_verification_'
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes in milliseconds

/**
 * Get cached slug verification result
 */
export function getCachedSlugVerification(slug: string): SlugCacheEntry | null {
  if (typeof window === 'undefined') return null

  try {
    const cacheKey = `${CACHE_PREFIX}${slug}`
    let cached = sessionStorage.getItem(cacheKey)
    if (!cached) {
      const legacy = sessionStorage.getItem(`${CACHE_PREFIX_LEGACY}${slug}`)
      if (legacy) {
        sessionStorage.removeItem(`${CACHE_PREFIX_LEGACY}${slug}`)
      }
      return null
    }

    const entry: SlugCacheEntry = JSON.parse(cached)
    
    // Check if cache is expired
    if (isCacheExpired(entry)) {
      sessionStorage.removeItem(cacheKey)
      return null
    }

    return entry
  } catch (error) {
    console.error('Error reading slug cache:', error)
    return null
  }
}

/**
 * Set cached slug verification result
 */
export function setCachedSlugVerification(
  slug: string,
  data: SlugVerificationResponse | null,
  isValid: boolean,
  blockReason?: SlugBlockReason
): void {
  if (typeof window === 'undefined') return

  try {
    const cacheKey = `${CACHE_PREFIX}${slug}`
    const entry: SlugCacheEntry = {
      slug,
      isValid,
      data: data || undefined,
      timestamp: Date.now(),
      ...(isValid ? {} : blockReason ? { blockReason } : {})
    }
    
    sessionStorage.setItem(cacheKey, JSON.stringify(entry))
  } catch (error) {
    console.error('Error setting slug cache:', error)
  }
}

/**
 * Check if cache entry is expired
 */
export function isCacheExpired(entry: SlugCacheEntry): boolean {
  const now = Date.now()
  return (now - entry.timestamp) > CACHE_TTL
}

/**
 * Clear slug verification cache
 * @param slug - If provided, clears only that slug's cache. Otherwise clears all slug caches.
 */
export function clearSlugCache(slug?: string): void {
  if (typeof window === 'undefined') return

  try {
    if (slug) {
      sessionStorage.removeItem(`${CACHE_PREFIX}${slug}`)
      sessionStorage.removeItem(`${CACHE_PREFIX_LEGACY}${slug}`)
    } else {
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_PREFIX_LEGACY)) {
          sessionStorage.removeItem(key)
        }
      })
    }
  } catch (error) {
    console.error('Error clearing slug cache:', error)
  }
}

