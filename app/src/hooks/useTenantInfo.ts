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
          const transformedInfo: TenantInfo = {
            company_name: cached.data.profile.company_name,
            slug: cached.data.branding.slug || cached.data.settings.slug || slug,
            logo_url: cached.data.branding.logo_url || null,
            favicon_url: cached.data.branding.favicon_url || null,
          }
          setTenantInfo(transformedInfo)
          setIsLoading(false)
          return
        }

        // Only make API call if cache miss or expired
        const response = await getTenantBySlug(slug)
        if (response.success && response.data) {
          // Transform the new API response structure to match expected format
          // Extract company_name from profile, logo_url and favicon_url from branding
          const transformedInfo: TenantInfo = {
            company_name: response.data.profile.company_name,
            slug: response.data.branding.slug || response.data.settings.slug || slug,
            logo_url: response.data.branding.logo_url || null,
            favicon_url: response.data.branding.favicon_url || null,
            // tenant_id may not be in the new response, but we'll keep it optional
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
