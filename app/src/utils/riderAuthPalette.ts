import type { TenantBranding } from '@api/tenant'
import { hexToRgba } from '@utils/colorTokens'

/**
 * Resolved palette consumed by RiderLogin / RiderRegistration.
 * Every field is a non-null hex / rgba string ready to inline.
 */
export type RiderAuthPalette = {
  bg: string
  brand: string
  brandHover: string
  brandTint: string
  inputBg: string
  inputBorder: string
  text: string
  muted: string
  labelMuted: string
  buttonText: string
  error: string
  errorBg: string
  errorBorder: string
}

// Defaults — MUST match the historical hardcoded PALETTE in RiderLogin.tsx and
// RiderRegistration.tsx so the visual is unchanged when branding is off.
export const FALLBACK_RIDER_AUTH_PALETTE: RiderAuthPalette = {
  bg: '#0a0a12',
  brand: '#7c3aed',
  brandHover: '#6d28d9',
  brandTint: 'rgba(124,58,237,0.15)',
  inputBg: 'rgba(255,255,255,0.05)',
  inputBorder: 'rgba(255,255,255,0.1)',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.55)',
  labelMuted: 'rgba(255,255,255,0.45)',
  buttonText: '#ffffff',
  error: '#f87171',
  errorBg: 'rgba(248,113,113,0.08)',
  errorBorder: 'rgba(248,113,113,0.35)',
}

/**
 * Resolve the rider auth palette from the tenant's branding row.
 *
 * - When branding is undefined / null OR `enable_branding === false`, returns
 *   the fallback palette unchanged.
 * - When branding is enabled, every backend color override is applied; any
 *   nullable backend field falls back to its hardcoded counterpart.
 * - Tinted/derived colors (brandTint, errorBg, etc.) are computed from the
 *   resolved primary; computed-from-null safely falls back too.
 *
 * Error colors are intentionally NOT brand-driven — they remain universal red
 * so error states stay legible against any brand palette.
 */
export function resolveRiderAuthPalette(
  branding: TenantBranding | null | undefined,
): RiderAuthPalette {
  if (!branding || !branding.enable_branding) {
    return FALLBACK_RIDER_AUTH_PALETTE
  }

  const f = FALLBACK_RIDER_AUTH_PALETTE
  const brand = branding.primary_color || f.brand
  const brandHover = branding.accent_color || f.brandHover
  const text = branding.text_color || f.text

  return {
    bg: branding.background_color || f.bg,
    brand,
    brandHover,
    brandTint: hexToRgba(brand, 0.15) || f.brandTint,
    inputBg: branding.surface_color || f.inputBg,
    inputBorder: branding.surface_color
      ? hexToRgba(text, 0.1) || f.inputBorder
      : f.inputBorder,
    text,
    muted: branding.text_muted_color || f.muted,
    labelMuted: branding.text_muted_color
      ? hexToRgba(text, 0.6) || f.labelMuted
      : f.labelMuted,
    buttonText: branding.button_text_color || f.buttonText,
    error: f.error,
    errorBg: f.errorBg,
    errorBorder: f.errorBorder,
  }
}
