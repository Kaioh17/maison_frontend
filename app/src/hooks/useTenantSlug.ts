import { useParams } from 'react-router-dom'
import { extractSubdomain, getMainDomain } from '@utils/subdomain'

/**
 * Hook to extract tenant slug from URL
 * Primary: Reads from subdomain (e.g., tenant-slug.localhost)
 * Fallback: Reads from path params for backward compatibility
 */
export function useTenantSlug(): string | null {
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
  const params = useParams<{ slug?: string }>()
  return params.slug || null
}
