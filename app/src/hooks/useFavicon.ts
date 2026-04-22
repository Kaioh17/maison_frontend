import { useEffect } from 'react'
import { useTenantSlug } from './useTenantSlug'
import { getCachedSlugVerification, isCacheExpired } from '@utils/slugCache'
import { verifySlug, type SlugVerificationResponse } from '@api/tenant'

const DEFAULT_FAVICON = '/favicon.png'
const DEFAULT_ACCENT = '#6c63e8'
const DEFAULT_DOCUMENT_TITLE = 'Maison'

function resolveTenantDocumentTitle(companyName: string | undefined, slug: string): string {
  const trimmed = companyName?.trim()
  if (trimmed && trimmed.length > 0) {
    return trimmed
  }
  const s = slug?.trim()
  if (s) {
    return s
  }
  return DEFAULT_DOCUMENT_TITLE
}

function applyAppleMobileWebAppTitle(title: string) {
  let meta = document.querySelector("meta[name='apple-mobile-web-app-title']") as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'apple-mobile-web-app-title')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', title)
}

function applyDocumentTitleForTenant(companyName: string | undefined, slug: string) {
  const title = resolveTenantDocumentTitle(companyName, slug)
  document.title = title
  applyAppleMobileWebAppTitle(title)
}

function escapeSvgText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function normalizePrimaryColorForFavicon(color: string | null | undefined): string {
  if (!color || typeof color !== 'string') return DEFAULT_ACCENT
  const c = color.trim()
  if (/^#[0-9A-Fa-f]{6}$/.test(c)) return c
  if (/^#[0-9A-Fa-f]{3}$/.test(c)) {
    return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
  }
  return DEFAULT_ACCENT
}

/** First display character from company name, else first character of slug. */
function tenantFaviconLetter(companyName: string | undefined, slug: string): string {
  const trimmed = companyName?.trim()
  const source = trimmed && trimmed.length > 0 ? trimmed : slug || '?'
  const chars = [...source]
  return chars[0] ?? '?'
}

function buildLetterFaviconDataUrl(letter: string, backgroundColor: string): string {
  const ch = escapeSvgText(letter)
  const bg = normalizePrimaryColorForFavicon(backgroundColor)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${bg}"/><text x="32" y="32" font-family="system-ui,-apple-system,BlinkMacSystemFont,sans-serif" font-size="32" font-weight="600" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${ch}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function applyFaviconToDocument(href: string, mime: string) {
  document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']").forEach((el) => el.remove())
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = mime
  link.href = href
  document.head.appendChild(link)
}

/**
 * Hook to dynamically update the favicon and document title based on tenant slug verification.
 * Title uses profile.company_name when present (browser tab). Favicon uses branding.favicon_url when set;
 * otherwise an SVG generated from the first character of the tenant company name (primary color as background).
 */
export function useFavicon() {
  const slug = useTenantSlug()

  useEffect(() => {
    const updateFavicon = async () => {
      if (!slug) {
        applyFaviconToDocument(DEFAULT_FAVICON, 'image/png')
        applyDocumentTitleForTenant(undefined, '')
        return
      }

      try {
        let verification: SlugVerificationResponse | null = null

        const cached = getCachedSlugVerification(slug)
        if (cached && !isCacheExpired(cached) && cached.data) {
          verification = cached.data
        } else {
          const response = await verifySlug(slug)
          if (response.success && response.data) {
            verification = response.data
          }
        }

        if (!verification) {
          applyFaviconToDocument(DEFAULT_FAVICON, 'image/png')
          applyDocumentTitleForTenant(undefined, '')
          return
        }

        applyDocumentTitleForTenant(verification.profile?.company_name, slug)

        const faviconUrl = verification.branding?.favicon_url?.trim() || null
        if (faviconUrl) {
          applyFaviconToDocument(faviconUrl, 'image/png')
          return
        }

        const letter = tenantFaviconLetter(verification.profile?.company_name, slug)
        const primary = verification.branding?.primary_color
        const dataUrl = buildLetterFaviconDataUrl(letter, primary)
        applyFaviconToDocument(dataUrl, 'image/svg+xml')
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status !== 403) {
          console.error('Failed to update favicon:', error)
        }
        applyFaviconToDocument(DEFAULT_FAVICON, 'image/png')
        applyDocumentTitleForTenant(undefined, '')
      }
    }

    updateFavicon()
  }, [slug])
}
