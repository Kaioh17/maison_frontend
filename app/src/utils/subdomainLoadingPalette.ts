import { type TenantBranding } from '@api/tenant'
import { hexToRgba, pickColor } from '@utils/colorTokens'
import { getCachedSlugVerification } from '@utils/slugCache'

export type SubdomainLoadingPalette = {
  bg: string
  text: string
  muted: string
  accent: string
  border: string
}

const FALLBACK_SUBDOMAIN_LOADING_PALETTE: SubdomainLoadingPalette = {
  bg: '#0a0a12',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.58)',
  accent: '#7c3aed',
  border: 'rgba(255,255,255,0.14)',
}

function resolveBrandingPalette(branding: TenantBranding): SubdomainLoadingPalette {
  const bg = pickColor(branding.background_color, FALLBACK_SUBDOMAIN_LOADING_PALETTE.bg)!
  const text = pickColor(branding.text_color, FALLBACK_SUBDOMAIN_LOADING_PALETTE.text)!
  const muted = pickColor(
    branding.text_muted_color,
    hexToRgba(text, 0.58),
    FALLBACK_SUBDOMAIN_LOADING_PALETTE.muted,
  )!
  const accent = pickColor(
    branding.primary_color,
    branding.accent_color,
    FALLBACK_SUBDOMAIN_LOADING_PALETTE.accent,
  )!
  const border = pickColor(
    hexToRgba(text, 0.14),
    branding.surface_color,
    FALLBACK_SUBDOMAIN_LOADING_PALETTE.border,
  )!

  return { bg, text, muted, accent, border }
}

/**
 * Resolve a tenant-aware loading palette for subdomain routes.
 * Uses cached slug verification branding to avoid extra API calls in loaders.
 */
export function resolveSubdomainLoadingPalette(slug: string | null | undefined): SubdomainLoadingPalette {
  if (!slug) return FALLBACK_SUBDOMAIN_LOADING_PALETTE
  const cached = getCachedSlugVerification(slug)
  const branding = cached?.data?.branding
  if (!cached?.isValid || !branding?.enable_branding) {
    return FALLBACK_SUBDOMAIN_LOADING_PALETTE
  }
  return resolveBrandingPalette(branding)
}

