import { useEffect } from 'react'
import { useTenantSlug } from './useTenantSlug'
import { getCachedSlugVerification, isCacheExpired } from '@utils/slugCache'
import { verifySlug, type SlugVerificationResponse } from '@api/tenant'
import { parseHex, pickColor } from '@utils/colorTokens'

const DEFAULT_FAVICON = '/favicon1.png'
const DEFAULT_APPLE_TOUCH_ICON = '/apple-touch-icon.png'
const DEFAULT_MANIFEST_HREF = '/manifest.webmanifest'
const DEFAULT_ACCENT = '#6c63e8'
/** Matches `index.html` and `:root --bw-bg` so non-tenant / fallback chrome stays consistent. */
const DEFAULT_THEME_COLOR = '#0f0d1a'
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

function setOrCreateMeta(name: string, content: string) {
  let meta = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
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
  if (!branding?.enable_branding) {
    setOrCreateMeta('theme-color', DEFAULT_THEME_COLOR)
    applyRootChromeBackground(null)
    return
  }
  const hex =
    formatSolidHexForMeta(pickColor(branding.background_color)) ?? DEFAULT_THEME_COLOR
  setOrCreateMeta('theme-color', hex)
  applyRootChromeBackground(hex)
}

function applyDocumentTitleForTenant(companyName: string | undefined, slug: string) {
  const title = resolveTenantDocumentTitle(companyName, slug)
  document.title = title
  // Both meta tags drive the home-screen label on iOS Safari and Android Chrome.
  setOrCreateMeta('apple-mobile-web-app-title', title)
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

function setOrCreateLink(rel: string, href: string, opts: { type?: string; sizes?: string } = {}) {
  let link = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = rel
    document.head.appendChild(link)
  }
  link.href = href
  if (opts.type) {
    link.type = opts.type
  } else {
    link.removeAttribute('type')
  }
  if (opts.sizes) {
    link.setAttribute('sizes', opts.sizes)
  } else {
    link.removeAttribute('sizes')
  }
}

/**
 * Keep the apple-touch-icon link in sync so iOS uses tenant branding when
 * the user "Adds to Home Screen" from an already-rendered tab.
 * Note: iOS Safari often snapshots the icon from the *initial* HTML on first
 * paint, so the backend `/apple-touch-icon.png` endpoint (which is per-host)
 * is the install-time source of truth — this runtime update is a safety net
 * for in-session navigations.
 */
function applyAppleTouchIcon(href: string) {
  setOrCreateLink('apple-touch-icon', href, { sizes: '180x180' })
}

/**
 * Force the manifest link to refetch so browsers that re-read it on visibility
 * change pick up tenant-branded name/colors/icons. iOS does not currently
 * consult the manifest at install time, but Android Chrome may revalidate.
 */
function refreshManifestLink() {
  const link = document.querySelector("link[rel='manifest']") as HTMLLinkElement | null
  if (!link) {
    setOrCreateLink('manifest', DEFAULT_MANIFEST_HREF)
    return
  }
  // Strip any existing cache buster, then append one so the browser refetches
  // even if the URL was otherwise identical across renders.
  const base = link.href.split('?')[0]
  link.href = `${base}?ts=${Date.now()}`
}

function applyDefaultPwaBranding() {
  applyFaviconToDocument(DEFAULT_FAVICON, 'image/png')
  applyAppleTouchIcon(DEFAULT_APPLE_TOUCH_ICON)
  applyDocumentTitleForTenant(undefined, '')
  setOrCreateMeta('theme-color', DEFAULT_THEME_COLOR)
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
 * Install-time PWA metadata (manifest icons + apple-touch-icon) is served by the
 * backend per-Host so home-screen installs land on the correct tenant branding
 * even before this hook runs.
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
          applyAppleTouchIcon(faviconUrl)
        } else {
          const letter = tenantFaviconLetter(verification.profile?.company_name, slug)
          const primary = verification.branding?.primary_color
          const dataUrl = buildLetterFaviconDataUrl(letter, primary)
          applyFaviconToDocument(dataUrl, 'image/svg+xml')
          // The backend endpoint always returns a per-host PNG so iOS gets a
          // tenant-branded raster even when no favicon_url is set.
          applyAppleTouchIcon(DEFAULT_APPLE_TOUCH_ICON)
        }

        refreshManifestLink()
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
