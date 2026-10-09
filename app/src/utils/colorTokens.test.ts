import { describe, it, expect } from 'vitest'
import { brandingCssVars, brandingFontVars, cssColorToHex, normalizeHex } from './colorTokens'

describe('brandingCssVars', () => {
  it('maps brand colors to tokens and derives text-based tints', () => {
    const v = brandingCssVars({ primary_color: '#112233', accent_color: '#445566', text_color: '#ffffff', button_text_color: '#000000' })
    expect(v['--bw-accent']).toBe('#112233')
    expect(v['--bw-accent-hover']).toBe('#445566')
    expect(v['--rider-on-primary']).toBe('#000000')
    expect(v['--bw-border']).toBe('rgba(255,255,255,0.1)')
  })

  it('omits tokens for blank colors so the global theme shows through', () => {
    const v = brandingCssVars({ primary_color: '', text_color: null })
    expect(v).toEqual({})
  })
})

describe('normalizeHex / cssColorToHex', () => {
  it('accepts typed hex in any common spelling and rejects partial input', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc')
    expect(normalizeHex('6c63e8')).toBe('#6c63e8')
    expect(normalizeHex('#6c63')).toBeNull()
    expect(normalizeHex('#zzzzzz')).toBeNull()
    expect(normalizeHex('')).toBeNull()
  })

  it('reads computed rgb() colors and ignores transparent ones', () => {
    expect(cssColorToHex('rgb(108, 99, 232)')).toBe('#6c63e8')
    expect(cssColorToHex('rgba(0, 0, 0, 0)')).toBeNull()
    expect(cssColorToHex('rgba(255, 255, 255, 0.5)')).toBe('#ffffff')
    expect(cssColorToHex('#7068cc')).toBe('#7068cc')
  })
})

describe('font scope', () => {
  const b = { font_heading: 'Playfair Display', font_scope: 'rider_driver' }
  it('emits fonts only for surfaces in scope', () => {
    expect(brandingCssVars(b, 'driver')['--bw-font-heading']).toContain('Playfair Display')
    expect(brandingCssVars(b, 'rider')['--bw-font-heading']).toContain('Playfair Display')
    expect(brandingFontVars(b, 'landing')).toEqual({})
  })
  it('defaults to rider only and ignores names outside the catalog', () => {
    expect(brandingFontVars({ font_heading: 'Inter' }, 'driver')).toEqual({})
    expect(brandingFontVars({ font_heading: 'x;y', font_scope: 'all' }, 'landing')).toEqual({})
  })
})
