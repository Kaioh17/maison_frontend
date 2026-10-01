/**
 * Shared color helpers used by tenant-branding-aware code paths
 * (rider auth palette + rider-space CSS variable shell).
 *
 * Keep this module dependency-free: it's imported by both runtime React
 * components and pure utility modules, and we want it tree-shakeable.
 */

/** Parse a hex color (#abc, #aabbcc, with or without leading #) into [r,g,b]. */
export function parseHex(hex: string | null | undefined): [number, number, number] | null {
  if (!hex || typeof hex !== 'string') return null
  const m = hex.trim().replace('#', '')
  if (![3, 6].includes(m.length)) return null
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if ([r, g, b].some(Number.isNaN)) return null
  return [r, g, b]
}

/**
 * Build an `rgba(r,g,b,a)` string from a hex color. Returns `null` on bad
 * input so callers can fall back to a hardcoded default instead of emitting
 * an invalid CSS color.
 */
export function hexToRgba(hex: string | null | undefined, alpha: number): string | null {
  const rgb = parseHex(hex)
  if (!rgb) return null
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`
}

/**
 * Pick the first non-empty trimmed string from the list of candidates.
 * Returns `null` if every candidate is missing/blank — callers can then
 * decide whether to fall back to a hardcoded default or omit the value.
 */
export function pickColor(...candidates: Array<string | null | undefined>): string | null {
  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim() !== '') return c.trim()
  }
  return null
}

export interface BrandingColorInput {
  primary_color?: string | null
  accent_color?: string | null
  background_color?: string | null
  surface_color?: string | null
  text_color?: string | null
  text_muted_color?: string | null
  button_text_color?: string | null
}

/**
 * Map a tenant's branding colors onto the `--bw-*` / `--rider-*` tokens the rider
 * pages read. Sparse on purpose: a color the tenant left blank is omitted so the
 * element inherits the global theme. Status colors (--bw-error/success/warning)
 * are never overridden so they stay legible on any palette.
 *
 * Shared by `RiderBrandedShell` (live rider pages) and the branding-settings
 * phone preview, so the preview can't drift from what riders actually see.
 */
export function brandingCssVars(b: BrandingColorInput): Record<string, string> {
  const text = pickColor(b.text_color)
  const muted = pickColor(b.text_muted_color)
  const bg = pickColor(b.background_color)
  const surface = pickColor(b.surface_color)
  const primary = pickColor(b.primary_color)
  const accent = pickColor(b.accent_color)
  const buttonText = pickColor(b.button_text_color)

  // Derived tokens - only computed when their source is defined so we don't
  // emit `rgba(NaN,NaN,NaN,...)` for tenants who left text_color null.
  const hairline = text ? hexToRgba(text, 0.06) : null
  const border = text ? hexToRgba(text, 0.1) : null
  const borderStrong = text ? hexToRgba(text, 0.2) : null
  const rowHover = text ? hexToRgba(text, 0.05) : null
  const rowHoverStrong = text ? hexToRgba(text, 0.1) : null
  const notesBg = text ? hexToRgba(text, 0.04) : null
  const fieldInsetGlow = text ? `inset 0 1px 0 ${hexToRgba(text, 0.04)}` : null

  const out: Record<string, string> = {}
  const set = (key: string, value: string | null) => {
    if (value) out[key] = value
  }

  // Generic --bw-* tokens used by everything (cards, inputs, buttons, ...)
  set('--bw-bg', bg)
  set('--bw-fg', text)
  set('--bw-text', text)
  set('--bw-muted', muted)
  set('--bw-bg-secondary', surface)
  set('--bw-border', border)
  set('--bw-border-strong', borderStrong)
  set('--bw-focus', primary)
  set('--bw-accent', primary)
  set('--bw-accent-hover', accent)
  set('--bw-bg-hover', rowHover)
  set('--bw-bg-hover-strong', rowHoverStrong)

  // Rider-specific tokens (defined in styles.css :root).
  set('--rider-surface-elevated', surface)
  // Rider pages use --rider-surface-inset for nested fills (notes, sub-cards);
  // mapping it to the page bg keeps the depth hierarchy consistent.
  set('--rider-surface-inset', bg)
  set('--rider-primary', primary)
  set('--rider-on-primary', buttonText)
  set('--rider-row-hover', rowHover)
  set('--rider-hairline', hairline)
  set('--rider-notes-bg', notesBg)
  set('--rider-field-inset-glow', fieldInsetGlow)

  // Page-level color/bg so `color: inherit` chains and any element that
  // doesn't read a CSS var directly still land on the brand palette.
  set('color', text)
  set('background', bg)

  return out
}
