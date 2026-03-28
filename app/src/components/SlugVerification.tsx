import { useEffect, useState } from 'react'
import { verifySlug } from '@api/tenant'
import { useTenantSlug } from '@hooks/useTenantSlug'
import { getCachedSlugVerification, setCachedSlugVerification, isCacheExpired, type SlugBlockReason } from '@utils/slugCache'
import {
  isGuestAccessDeniedAxiosError,
  isGuestAccessDeniedPayload,
  isGuestAccessDeniedSuccessEnvelope,
} from '@utils/slugGuestAccess'
import NotFound404 from './NotFound404'
import SlugOwnerContactNotice from './SlugOwnerContactNotice'

interface SlugVerificationProps {
  children: React.ReactNode
}

export default function SlugVerification({ children }: SlugVerificationProps) {
  const slug = useTenantSlug()
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [blockReason, setBlockReason] = useState<SlugBlockReason | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setIsValid(false)
      setBlockReason(null)
      setIsLoading(false)
      return
    }

    const checkSlug = async () => {
      // Check cache first
      const cached = getCachedSlugVerification(slug)
      if (cached && !isCacheExpired(cached)) {
        setIsValid(cached.isValid)
        setBlockReason(cached.isValid ? null : cached.blockReason ?? null)
        setIsLoading(false)
        return // No API call needed
      }

      // Only make API call if cache miss or expired
      try {
        setIsLoading(true)
        const response = await verifySlug(slug)
        const hasPayload = !!(response.success && response.data)

        if (hasPayload && isGuestAccessDeniedPayload(response.data)) {
          setIsValid(false)
          setBlockReason('forbidden')
          setCachedSlugVerification(slug, null, false, 'forbidden')
        } else if (hasPayload) {
          setIsValid(true)
          setBlockReason(null)
          setCachedSlugVerification(slug, response.data!, true)
        } else {
          const forbidden = isGuestAccessDeniedSuccessEnvelope(response)
          setIsValid(false)
          setBlockReason(forbidden ? 'forbidden' : null)
          setCachedSlugVerification(slug, null, false, forbidden ? 'forbidden' : undefined)
        }
      } catch (error: any) {
        const status = error.response?.status as number | undefined
        const forbidden = isGuestAccessDeniedAxiosError(error)
        setIsValid(false)
        setBlockReason(forbidden ? 'forbidden' : null)

        // Cache the invalid result to avoid repeated failed calls
        setCachedSlugVerification(slug, null, false, forbidden ? 'forbidden' : undefined)

        if (status !== 404 && status !== 403 && !forbidden) {
          console.error('Slug verification error:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkSlug()
  }, [slug])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'Work Sans, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!isValid) {
    if (blockReason === 'forbidden') {
      return <SlugOwnerContactNotice />
    }
    return <NotFound404 />
  }

  return <>{children}</>
}
