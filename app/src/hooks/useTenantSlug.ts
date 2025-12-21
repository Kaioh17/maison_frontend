import { useParams } from 'react-router-dom'

/**
 * Hook to extract tenant slug from URL
 * Supports both /{slug}/riders/* and /riders/* patterns
 */
export function useTenantSlug(): string | null {
  const params = useParams<{ slug?: string }>()
  return params.slug || null
}
