import { useState, useEffect } from 'react'
import { getTenantBySlug, type SlugVerificationResponse } from '@api/tenant'
import { useTenantSlug } from './useTenantSlug'
import { getCachedSlugVerification, setCachedSlugVerification, isCacheExpired } from '@utils/slugCache'

// Type that combines settings and profile for easier consumption
export type TenantInfo = {
  company_name: string
  slug: string
  logo_url?: string | null
  favicon_url?: string | null
  tenant_id?: number // May not be available in new response
  [key: string]: any // Allow other fields for backward compatibility
}

export function useTenantInfo() {
  const slug = useTenantSlug()
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setTenantInfo(null)
      setError(null)
      return
    }

    const fetchTenantInfo = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check cache first - getTenantBySlug uses the same endpoint as verifySlug
        const cached = getCachedSlugVerification(slug)
        if (cached && !isCacheExpired(cached) && cached.data) {
          // Use cached data if available
          // Note: tenant_id is not cached, so we'll need to fetch it if needed
          const transformedInfo: TenantInfo = {
            company_name: cached.data.profile.company_name,
            slug: cached.data.branding.slug || slug,
            logo_url: cached.data.branding.logo_url || null,
            favicon_url: cached.data.branding.favicon_url || null,
            // tenant_id not available from cache, will need to fetch if required
          }
          setTenantInfo(transformedInfo)
          setIsLoading(false)
          // If tenant_id is needed, we might need to make an API call anyway
          // For now, return and let the component handle the missing tenant_id
          return
        }

        // Only make API call if cache miss or expired
        const response = await getTenantBySlug(slug)
        if (response.success && response.data) {
          // Extract tenant_id from meta if available, or try to get it from response data
          let tenantId: number | undefined = undefined
          
          // Check meta first
          if (response.meta?.tenant_id) {
            tenantId = typeof response.meta.tenant_id === 'number' 
              ? response.meta.tenant_id 
              : parseInt(String(response.meta.tenant_id))
          }
          
          // If not in meta, check if it's in the data structure itself
          // (some API responses might include it directly)
          if (!tenantId && (response.data as any).tenant_id) {
            tenantId = typeof (response.data as any).tenant_id === 'number'
              ? (response.data as any).tenant_id
              : parseInt(String((response.data as any).tenant_id))
          }
          
          // Transform the new API response structure to match expected format
          // Extract company_name from profile, logo_url and favicon_url from branding
          const transformedInfo: TenantInfo = {
            company_name: response.data.profile.company_name,
            slug: response.data.branding.slug || slug,
            logo_url: response.data.branding.logo_url || null,
            favicon_url: response.data.branding.favicon_url || null,
            tenant_id: tenantId,
            // Do NOT implement color theming yet (skip primary_color, secondary_color, etc.)
          }
          setTenantInfo(transformedInfo)
          
          // Update cache with the response data
          setCachedSlugVerification(slug, response.data, true)
        } else {
          setError('Tenant not found')
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Failed to load tenant information')
        setTenantInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTenantInfo()
  }, [slug])

  return { tenantInfo, isLoading, error, slug }
}
