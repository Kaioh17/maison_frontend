import { useEffect, useState } from 'react'
import { verifySlug } from '@api/tenant'
import { useTenantSlug } from '@hooks/useTenantSlug'
import { getCachedSlugVerification, setCachedSlugVerification, isCacheExpired } from '@utils/slugCache'
import NotFound404 from './NotFound404'

interface SlugVerificationProps {
  children: React.ReactNode
}

export default function SlugVerification({ children }: SlugVerificationProps) {
  const slug = useTenantSlug()
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setIsValid(false)
      setIsLoading(false)
      return
    }

    const checkSlug = async () => {
      // Check cache first
      const cached = getCachedSlugVerification(slug)
      if (cached && !isCacheExpired(cached)) {
        setIsValid(cached.isValid)
        setIsLoading(false)
        return // No API call needed
      }

      // Only make API call if cache miss or expired
      try {
        setIsLoading(true)
        const response = await verifySlug(slug)
        const isValidResult = response.success && !!response.data
        setIsValid(isValidResult)
        
        // Cache the result
        setCachedSlugVerification(slug, response.data || null, isValidResult)
      } catch (error: any) {
        // Check if it's a 404 error
        const isValidResult = false
        setIsValid(isValidResult)
        
        // Cache the invalid result to avoid repeated failed calls
        setCachedSlugVerification(slug, null, isValidResult)
        
        if (error.response?.status !== 404) {
          // Log non-404 errors for debugging
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
    return <NotFound404 />
  }

  return <>{children}</>
}
