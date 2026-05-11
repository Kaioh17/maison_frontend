import { useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { hexToRgba, pickColor } from '@utils/colorTokens'

interface RiderBrandedShellProps {
  children: ReactNode
}

/**
 * Wraps any subtree (typically a rider-space route) with CSS custom property
 * overrides driven by `tenantInfo.branding`. Every rider page already reads
 * `var(--bw-*)` / `var(--rider-*)` for its colors, so overriding those tokens
 * at this layer re-skins the entire subtree without per-page edits.
 *
 * Behavior:
 * - When `branding` is missing OR `enable_branding === false`, render children
 *   unchanged (the global :root / [data-theme] CSS variables apply normally).
 *   We render a fragment in that case so no extra DOM / stacking context is
 *   introduced — every existing layout (sticky headers, 100vh containers,
 *   modal portals) stays byte-identical to today.
 * - When `branding` is enabled, override every relevant token. Any field the
 *   tenant left null falls back to `var(--*)` from the global theme (we omit
 *   the var entirely rather than setting it to an empty string).
 * - Sets `data-theme` on the wrapper to the tenant's preference so theme-scoped
 *   global rules (scrollbars, [data-theme="light"] in styles.css) still match.
 *
 * Status colors (--bw-error / --bw-success / --bw-warning) are intentionally
 * NOT overridden — those must remain universally legible regardless of the
 * tenant palette.
 *
 * NOTE: `useTenantInfo` reads from the slug-verification cache, which is
 * sessionStorage-backed with a ~10 minute TTL (see utils/slugCache.ts). After
 * a tenant toggles branding mid-session, riders won't see the change until
 * the cache expires or they hard reload.
 *
 * NOTE: Portaled content (createPortal, dropdowns, modals rendered outside
 * the React DOM subtree) does NOT inherit these overrides because CSS custom
 * properties cascade by DOM ancestry, not by React tree. Such surfaces will
 * fall through to the global :root palette and need to be handled separately.
 */
export default function RiderBrandedShell({ children }: RiderBrandedShellProps) {
  const { tenantInfo } = useTenantInfo()
  const branding = tenantInfo?.branding

  const styleVars = useMemo<CSSProperties | undefined>(() => {
    if (!branding || !branding.enable_branding) return undefined

    const text = pickColor(branding.text_color)
    const muted = pickColor(branding.text_muted_color)
    const bg = pickColor(branding.background_color)
    const surface = pickColor(branding.surface_color)
    const primary = pickColor(branding.primary_color)
    const accent = pickColor(branding.accent_color)
    const buttonText = pickColor(branding.button_text_color)

    // Derived tokens — only computed when their source is defined so we don't
    // emit `rgba(NaN,NaN,NaN,…)` for tenants who left text_color null.
    const hairline = text ? hexToRgba(text, 0.06) : null
    const border = text ? hexToRgba(text, 0.1) : null
    const borderStrong = text ? hexToRgba(text, 0.2) : null
    const rowHover = text ? hexToRgba(text, 0.05) : null
    const rowHoverStrong = text ? hexToRgba(text, 0.1) : null
    const notesBg = text ? hexToRgba(text, 0.04) : null
    const fieldInsetGlow = text ? `inset 0 1px 0 ${hexToRgba(text, 0.04)}` : null

    // Build a sparse object — only set vars when we actually have a value.
    // Omitted entries inherit from the parent (:root or [data-theme=...]).
    const out: Record<string, string> = {}
    const set = (key: string, value: string | null) => {
      if (value) out[key] = value
    }

    // Generic --bw-* tokens used by everything (cards, inputs, buttons, …)
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

    // Rider-specific tokens (defined in styles.css :root, lines ~77–88).
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

    return out as CSSProperties
  }, [branding])

  // Branding off: passthrough fragment, no DOM diff vs. pre-shell layout.
  if (!styleVars) {
    return <>{children}</>
  }

  // Mirror the tenant's preferred theme onto the wrapper so [data-theme="..."]
  // selectors in styles.css (light-theme block, scrollbars, etc.) match
  // anything inside the rider subtree. Default to 'dark' if unset.
  const dataTheme = branding?.theme || 'dark'

  return (
    <div
      data-rider-branded-shell=""
      data-theme={dataTheme}
      style={{
        ...styleVars,
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  )
}
