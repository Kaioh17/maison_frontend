/**
 * Fonts a tenant can pick for the rider app. All are self-hosted (see fonts.css), so the picker
 * can render each one and the rider app needs no extra request to use it.
 * Keep `BRAND_FONTS` in sync with `BRAND_FONTS` in backend schemas/tenant_setting.py.
 */
export const BRAND_FONTS = [
  { name: 'DM Sans', serif: false },
  { name: 'Work Sans', serif: false },
  { name: 'Inter', serif: false },
  { name: 'Manrope', serif: false },
  { name: 'Lexend', serif: false },
  { name: 'Geist', serif: false },
  { name: 'Instrument Serif', serif: true },
  { name: 'Playfair Display', serif: true },
  { name: 'Fraunces', serif: true },
  { name: 'Cormorant', serif: true },
] as const

export type FontField = 'font_heading' | 'font_body' | 'font_accent'

/** The three places type is used in the rider app. `fallback` is what riders see while the field is blank. */
export const FONT_ROLES: { field: FontField; cssVar: string; label: string; description: string; fallback: string; sample: string }[] = [
  { field: 'font_heading', cssVar: '--bw-font-heading', label: 'Headings', fallback: 'DM Sans', description: 'Page titles and your brand mark.', sample: 'Good evening, James' },
  { field: 'font_body', cssVar: '--bw-font-body', label: 'Body', fallback: 'Work Sans', description: 'Buttons, forms, labels and everything else.', sample: 'Airport transfer, 4:30 PM pickup' },
  { field: 'font_accent', cssVar: '--bw-font-accent', label: 'Accent', fallback: 'Instrument Serif', description: 'The one featured highlight, such as the service you offer first.', sample: 'Airport' },
]

export const fontStack = (name: string) => `"${name}", ${BRAND_FONTS.find(f => f.name === name)?.serif ? 'serif' : 'sans-serif'}`

/** Where the tenant's fonts show up. Each step adds a surface to the one before it. */
export type FontScope = 'rider' | 'rider_driver' | 'all'
export type FontSurface = 'rider' | 'driver' | 'landing'

export const FONT_SCOPES: { id: FontScope; label: string; surfaces: FontSurface[] }[] = [
  { id: 'rider', label: 'Rider app only', surfaces: ['rider'] },
  { id: 'rider_driver', label: 'Rider + driver apps', surfaces: ['rider', 'driver'] },
  { id: 'all', label: 'All three', surfaces: ['rider', 'driver', 'landing'] },
]

/** Blank or unknown scope means the original behavior: rider app only. */
export const fontsApply = (scope: string | null | undefined, surface: FontSurface) =>
  (FONT_SCOPES.find(s => s.id === scope) ?? FONT_SCOPES[0]).surfaces.includes(surface)
