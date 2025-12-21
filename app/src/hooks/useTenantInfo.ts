import { useState, useEffect } from 'react'
import { getTenantBySlug, type TenantProfile } from '@api/tenant'
import { useTenantSlug } from './useTenantSlug'

export function useTenantInfo() {
  const slug = useTenantSlug()
  const [tenantInfo, setTenantInfo] = useState<TenantProfile | null>(null)
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
          setTenantInfo(response.data)
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
