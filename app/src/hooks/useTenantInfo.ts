import { useState, useEffect } from 'react'
import { getTenantBySlug, type SlugVerificationResponse, type TenantSettingsResponse, type TenantBranding } from '@api/tenant'
import { useTenantSlug } from './useTenantSlug'
import { getCachedSlugVerification, setCachedSlugVerification, isCacheExpired } from '@utils/slugCache'

// Type that combines settings and profile for easier consumption
export type TenantInfo = {
  company_name: string
  slug: string
  logo_url?: string | null
  favicon_url?: string | null
  tenant_id?: number // May not be available in new response
  /**
   * Best public email riders can use for this tenant.
   * Comes from slug verify `branding.email_from_address` (not the tenant’s private login email unless operators set it there).
   */
  contact_email?: string | null
  /** Public contact phone for riders; branding.phone takes precedence when set. */
  contact_phone?: string | null
  /** Core tenant settings from `/v1/slug/:slug` (same shape as config.settings PATCH/GET). */
  settings?: TenantSettingsResponse
  /** Full branding row (palette + theme + enable_branding) from `/v1/slug/:slug`. */
  branding?: TenantBranding
  [key: string]: any // Allow other fields for backward compatibility
}

function toTenantInfo(data: SlugVerificationResponse, slug: string, tenantId?: number): TenantInfo {
  return {
    company_name: data.profile.company_name,
    slug: data.branding.slug || slug,
    logo_url: data.branding.logo_url || null,
    favicon_url: data.branding.favicon_url || null,
    contact_email: data.branding.email_from_address?.trim() || null,
    contact_phone: data.branding.phone?.trim() || data.profile.phone_no?.trim() || null,
    tenant_id: tenantId, // not cached: only present right after a network fetch
    settings: data.settings,
    branding: data.branding,
  }
}

/** Slugs already re-checked against the server in this page load (the cache serves instantly, once). */
const revalidated = new Set<string>()
/** Every mounted hook re-reads the cache when a background re-check changes it. */
const listeners = new Set<() => void>()

/**
 * Tenant info for the current subdomain. The 10-minute cache answers immediately, then the first
 * hook per page load re-checks the server and tells all hooks, so a tenant's branding change
 * reaches riders on their next open instead of after the cache expires.
 */
export function useTenantInfo() {
  const slug = useTenantSlug()
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    const sync = () => {
      const cached = getCachedSlugVerification(slug)
      if (cached?.data) setTenantInfo(prev => toTenantInfo(cached.data!, slug, prev?.tenant_id))
    }
    listeners.add(sync)
    return () => { listeners.delete(sync) }
  }, [slug])

  useEffect(() => {
    if (!slug) {
      setTenantInfo(null)
      setError(null)
      return
    }

    const fetchTenantInfo = async () => {
      const cached = getCachedSlugVerification(slug)
      const hasCache = !!(cached && !isCacheExpired(cached) && cached.data)
      if (hasCache) {
        setTenantInfo(toTenantInfo(cached!.data!, slug))
        if (revalidated.has(slug)) return
      }
      revalidated.add(slug)
      try {
        if (!hasCache) setIsLoading(true)
        setError(null)
        const response = await getTenantBySlug(slug)
        if (response.success && response.data) {
          const meta = response.meta?.tenant_id ?? (response.data as { tenant_id?: unknown }).tenant_id
          const parsed = meta == null ? NaN : typeof meta === 'number' ? meta : parseInt(String(meta))
          setTenantInfo(toTenantInfo(response.data, slug, Number.isNaN(parsed) ? undefined : parsed))
          setCachedSlugVerification(slug, response.data, true)
          if (hasCache) listeners.forEach(l => l())
        } else if (!hasCache) {
          setError('Tenant not found')
        }
      } catch (err: any) {
        // A failed re-check keeps showing the cached tenant.
        if (!hasCache) {
          setError(err.response?.data?.detail || err.message || 'Failed to load tenant information')
          setTenantInfo(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTenantInfo()
  }, [slug])

  return { tenantInfo, isLoading, error, slug }
}
