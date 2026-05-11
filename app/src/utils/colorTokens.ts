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
