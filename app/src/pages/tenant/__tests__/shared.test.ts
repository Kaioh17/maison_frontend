import { getDashboardColors, DASH_LABEL_STYLE, DASH_VALUE_STYLE } from '../shared'

/**
 * White-label regression guard (maison-ui skill §1).
 *
 * When a tenant supplies a custom theme, RiderBrandedShell overwrites the `--bw-*`
 * variables at runtime. Any color that getDashboardColors resolves to a literal in
 * that mode is a color the tenant cannot override — their dashboard would render
 * partly in Maison's default brand. So in custom-theme mode every value must be a
 * `var(--bw-*)` reference and nothing else.
 */
describe('getDashboardColors', () => {
  const CUSTOM = { isCustomThemeActive: true, lightMode: false }

  it('emits no hardcoded colors when a tenant theme is active', () => {
    const colors = getDashboardColors(CUSTOM)
    const offenders = Object.entries(colors).filter(([, value]) =>
      /#[0-9a-fA-F]{3,8}\b|\brgba?\(/.test(value)
    )
    expect(offenders).toEqual([])
  })

  it('routes every custom-theme color through a --bw-* variable', () => {
    const colors = getDashboardColors(CUSTOM)
    for (const [key, value] of Object.entries(colors)) {
      // `none` is a keyword, not a color (cardShadow) — nothing to tokenize.
      if (value === 'none') continue
      expect(value, `${key} must reference a --bw-* token`).toMatch(/var\(--bw-[a-z-]+\)/)
    }
  })

  it('is unaffected by lightMode while a tenant theme is active', () => {
    // data-theme drives light/dark for custom themes; the JS must not second-guess it.
    expect(getDashboardColors({ isCustomThemeActive: true, lightMode: true })).toEqual(
      getDashboardColors({ isCustomThemeActive: true, lightMode: false })
    )
  })

  it('does distinguish light from dark for the default Maison brand', () => {
    const light = getDashboardColors({ isCustomThemeActive: false, lightMode: true })
    const dark = getDashboardColors({ isCustomThemeActive: false, lightMode: false })
    expect(light.cardBg).not.toBe(dark.cardBg)
    expect(light.primaryText).not.toBe(dark.primaryText)
  })

  it('always resolves accent to the token, in every mode', () => {
    for (const isCustomThemeActive of [true, false]) {
      for (const lightMode of [true, false]) {
        expect(getDashboardColors({ isCustomThemeActive, lightMode }).accent).toBe(
          'var(--bw-accent)'
        )
      }
    }
  })
})

describe('shared typography primitives', () => {
  it('keeps DASH_* styles color-free so callers supply the themed color', () => {
    expect(DASH_LABEL_STYLE).not.toHaveProperty('color')
    expect(DASH_VALUE_STYLE).not.toHaveProperty('color')
  })

  it('renders figures with tabular-nums so updating numbers do not jitter', () => {
    expect(DASH_VALUE_STYLE.fontVariantNumeric).toBe('tabular-nums')
  })

  it('uses the 12px uppercase tracked treatment for labels', () => {
    expect(DASH_LABEL_STYLE).toMatchObject({
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
    })
  })
})
