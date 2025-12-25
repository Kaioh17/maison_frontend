import { useState, useEffect } from 'react'
import { getTenantBySlug, type SlugVerificationResponse } from '@api/tenant'
import { useTenantSlug } from './useTenantSlug'

// Type that combines settings and profile for easier consumption
export type TenantInfo = {
  company_name: string
  slug: string
  logo_url?: string | null
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
        const response = await getTenantBySlug(slug)
        if (response.success && response.data) {
          // Transform the new API response structure to match expected format
          const transformedInfo: TenantInfo = {
            company_name: response.data.profile.company_name,
            slug: response.data.settings.slug,
            logo_url: response.data.settings.logo_url,
            // tenant_id may not be in the new response, but we'll keep it optional
          }
          setTenantInfo(transformedInfo)
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
