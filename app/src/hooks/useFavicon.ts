import { useEffect } from 'react'
import { useTenantSlug } from './useTenantSlug'
import { getCachedSlugVerification, isCacheExpired } from '@utils/slugCache'
import { verifySlug } from '@api/tenant'

/**
 * Hook to dynamically update the favicon based on tenant slug verification
 * Gets favicon_url from the branding object in SlugVerificationResponse
 */
export function useFavicon() {
  const slug = useTenantSlug()

  useEffect(() => {
    const updateFavicon = async () => {
      if (!slug) {
        // Reset to default favicon if no slug
        const existingLink = document.querySelector("link[rel='icon']") as HTMLLinkElement
        if (existingLink) {
          existingLink.href = '/favicon.png'
        }
        return
      }

      try {
        // Check cache first
        const cached = getCachedSlugVerification(slug)
        let faviconUrl: string | null = null

        if (cached && !isCacheExpired(cached) && cached.data) {
          faviconUrl = cached.data.branding?.favicon_url || null
        } else {
          // Fetch from API if not cached
          const response = await verifySlug(slug)
          if (response.success && response.data) {
            faviconUrl = response.data.branding?.favicon_url || null
          }
        }

        // Update favicon in document head
        if (faviconUrl) {
          // Remove existing favicon links
          const existingLinks = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']")
          existingLinks.forEach(link => link.remove())

          // Create new favicon link
          const link = document.createElement('link')
          link.rel = 'icon'
          link.type = 'image/png'
          link.href = faviconUrl
          document.head.appendChild(link)
        } else {
          // Reset to default if no favicon_url
          const existingLink = document.querySelector("link[rel='icon']") as HTMLLinkElement
          if (existingLink) {
            existingLink.href = '/favicon.png'
          }
        }
      } catch (error) {
        console.error('Failed to update favicon:', error)
        // Fallback to default favicon on error
        const existingLink = document.querySelector("link[rel='icon']") as HTMLLinkElement
        if (existingLink) {
          existingLink.href = '/favicon.png'
        }
      }
    }

    updateFavicon()
  }, [slug])
}

