import { useEffect } from 'react'
import { useTenantSlug } from './useTenantSlug'
import { getCachedSlugVerification, isCacheExpired } from '@utils/slugCache'
import { verifySlug, type SlugVerificationResponse } from '@api/tenant'
import { parseHex, pickColor } from '@utils/colorTokens'
import { cleanName, shortAppName } from '@utils/tenantName'

const DEFAULT_FAVICON = '/favicon-48x48.png'
const DEFAULT_ACCENT = '#6e5bd8'
const DEFAULT_DOCUMENT_TITLE = 'Maison'

function resolveTenantDocumentTitle(companyName: string | undefined, slug: string): string {
  return cleanName(companyName) || cleanName(slug) || DEFAULT_DOCUMENT_TITLE
}

function setOrCreateMeta(name: string, content: string) {
  let meta = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

/**
 * `index.html` ships one `theme-color` per OS color scheme (media attribute). A tenant's brand
 * color overrides all of them; `null` restores the shipped light/dark pair.
 */
function setThemeColor(color: string | null) {
  document.querySelectorAll<HTMLMetaElement>("meta[name='theme-color']").forEach((meta) => {
    meta.dataset.default ??= meta.content
    meta.content = color ?? meta.dataset.default
  })
}

/** Solid #rrggbb for `theme-color` and root backgrounds; null if the value is not a parseable hex. */
function formatSolidHexForMeta(color: string | null | undefined): string | null {
  const rgb = parseHex(pickColor(color))
  if (!rgb) return null
  const h = (n: number) => n.toString(16).padStart(2, '0')
  return `#${h(rgb[0])}${h(rgb[1])}${h(rgb[2])}`
}

/**
 * Mobile browsers (especially iOS) paint the overscroll / home-indicator "safe"
 * region from `theme-color` and from html/body background. Keep them aligned with
 * the tenant canvas color so the chin does not stay on the default purple shell.
 */
function applyRootChromeBackground(color: string | null) {
  const html = document.documentElement
  const body = document.body
  if (color) {
    html.style.setProperty('background-color', color)
    body.style.setProperty('background-color', color)
  } else {
    html.style.removeProperty('background-color')
    body.style.removeProperty('background-color')
  }
}

function applyTenantBrowserChrome(branding: SlugVerificationResponse['branding'] | null | undefined) {
  const hex = branding?.enable_branding ? formatSolidHexForMeta(pickColor(branding.background_color)) : null
  setThemeColor(hex)
  applyRootChromeBackground(hex)
}

function applyDocumentTitleForTenant(companyName: string | undefined, slug: string) {
  const title = resolveTenantDocumentTitle(companyName, slug)
  document.title = title
  // iOS Safari uses the title tag for the home-screen label (it truncates long ones), so give it the short form.
  setOrCreateMeta('apple-mobile-web-app-title', shortAppName(title))
  setOrCreateMeta('application-name', title)
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

function buildLetterFaviconDataUrl(letter: string, backgroundColor: string | null | undefined): string {
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

function applyDefaultPwaBranding() {
  applyFaviconToDocument(DEFAULT_FAVICON, 'image/png')
  applyDocumentTitleForTenant(undefined, '')
  setThemeColor(null)
  applyRootChromeBackground(null)
}

/**
 * Hook to dynamically update the favicon, document title, and mobile browser chrome
 * (`theme-color` + html/body background) from tenant slug verification.
 * Title uses profile.company_name when present (browser tab). Favicon uses branding.favicon_url when set;
 * otherwise an SVG generated from the first character of the tenant company name (primary color as background).
 * When `enable_branding` is true, the page canvas color (`background_color`) drives `theme-color` and root
 * backgrounds so overscroll / home-indicator safe areas match the tenant shell.
 *
 * Install-time PWA metadata (manifest + apple-touch-icon) is served by the backend per Host
 * and linked statically from `index.html`, so installs get the right branding before this hook runs.
 */
export function useFavicon() {
  const slug = useTenantSlug()

  useEffect(() => {
    const updateFavicon = async () => {
      if (!slug) {
        applyDefaultPwaBranding()
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
          applyDefaultPwaBranding()
          return
        }

        applyTenantBrowserChrome(verification.branding)
        applyDocumentTitleForTenant(verification.profile?.company_name, slug)

        const faviconUrl = verification.branding?.favicon_url?.trim() || null
        if (faviconUrl) {
          applyFaviconToDocument(faviconUrl, 'image/png')
        } else {
          const letter = tenantFaviconLetter(verification.profile?.company_name, slug)
          const primary = verification.branding?.primary_color
          const dataUrl = buildLetterFaviconDataUrl(letter, primary)
          applyFaviconToDocument(dataUrl, 'image/svg+xml')
        }
        // The manifest and apple-touch-icon links are static: the backend resolves
        // them per Host (tenant icon, then initials, then Maison), so JS never touches them.
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status !== 403) {
          console.error('Failed to update favicon:', error)
        }
        applyDefaultPwaBranding()
      }
    }

    updateFavicon()
  }, [slug])
}
