import { useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { brandingCssVars } from '@utils/colorTokens'

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

    return brandingCssVars(branding) as CSSProperties
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
        minHeight: 'var(--app-h)',
      }}
    >
      {children}
    </div>
  )
}
