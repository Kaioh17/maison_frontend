import { useParams } from 'react-router-dom'
import { extractSubdomain, getMainDomain } from '@utils/subdomain'

/**
 * Hook to extract tenant slug from URL
 * Primary: Reads from subdomain (e.g., tenant-slug.localhost)
 * Fallback: Reads from path params for backward compatibility
 */
export function useTenantSlug(): string | null {
  // Called unconditionally: hooks must run in the same order every render, and the
  // subdomain check below returns early. Only read after the subdomain path misses.
  const params = useParams<{ slug?: string }>()

  // Try to get slug from subdomain first
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const subdomain = extractSubdomain(hostname)
    const mainDomain = getMainDomain()
    if (subdomain && subdomain !== 'www' && subdomain !== mainDomain) {
      return subdomain
    }
  }

  // Fallback to path parameters for backward compatibility (during migration)
  return params.slug || null
}
