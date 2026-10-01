const SHORT_MAX = 12
// Control chars, line/paragraph separators, plus zero-width space (U+200B) and BOM (U+FEFF). ZWJ is kept: emoji and some scripts need it.
const INVISIBLE = new RegExp(`[\\p{Cc}\\p{Zl}\\p{Zp}${String.fromCharCode(0x200b, 0xfeff)}]`, 'gu')

// A cut can strand a zero-width joiner or variation selector (U+200D, U+FE0F) at the end.
const DANGLING = new RegExp(`(?:${String.fromCharCode(0x200d)}|${String.fromCharCode(0xfe0f)}| )+$`)

/** Strip control/invisible characters and collapse whitespace. */
export function cleanName(value: string | null | undefined): string {
  return (value ?? '').replace(INVISIBLE, ' ').split(/\s+/).filter(Boolean).join(' ')
}

/**
 * Home-screen label (max 12 characters): the full name if it fits, else as many
 * whole words as fit, else the first 12 characters. Mirrors `make_short_name`
 * in the backend (`pwa_service.py`), which feeds the manifest `short_name`; keep both in sync.
 */
export function shortAppName(name: string): string {
  const chars = [...name]
  if (chars.length <= SHORT_MAX) return name
  let out = ''
  for (const word of name.split(' ')) {
    const next = out ? `${out} ${word}` : word
    if ([...next].length > SHORT_MAX) break
    out = next
  }
  return out || chars.slice(0, SHORT_MAX).join('').replace(DANGLING, '')
}
