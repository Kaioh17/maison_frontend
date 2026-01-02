import type { SlugVerificationResponse } from '@api/tenant'

export interface SlugCacheEntry {
  slug: string
  isValid: boolean
  data?: SlugVerificationResponse
  timestamp: number
}

const CACHE_PREFIX = 'slug_verification_'
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes in milliseconds

/**
 * Get cached slug verification result
 */
export function getCachedSlugVerification(slug: string): SlugCacheEntry | null {
  if (typeof window === 'undefined') return null

  try {
    const cacheKey = `${CACHE_PREFIX}${slug}`
    const cached = sessionStorage.getItem(cacheKey)
    
    if (!cached) return null

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
  isValid: boolean
): void {
  if (typeof window === 'undefined') return

  try {
    const cacheKey = `${CACHE_PREFIX}${slug}`
    const entry: SlugCacheEntry = {
      slug,
      isValid,
      data: data || undefined,
      timestamp: Date.now()
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
      const cacheKey = `${CACHE_PREFIX}${slug}`
      sessionStorage.removeItem(cacheKey)
    } else {
      // Clear all slug verification caches
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          sessionStorage.removeItem(key)
        }
      })
    }
  } catch (error) {
    console.error('Error clearing slug cache:', error)
  }
}

